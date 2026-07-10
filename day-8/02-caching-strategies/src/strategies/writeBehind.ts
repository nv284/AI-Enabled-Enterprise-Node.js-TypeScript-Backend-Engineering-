import { redis, KEY, TTL } from "../cache";
import { dbGetProduct, dbUpdateProduct, Product } from "../db";

/**
 * WRITE-BEHIND (aka "write-back")
 *
 * Writes: app -> cache (fast ack) -> queue -> background worker -> db
 * Reads:  same as cache-aside.
 *
 * Pros: extremely fast writes.
 * Cons: risk of data loss if the process crashes before the queue drains.
 * Use when: you can tolerate a few seconds of "not yet in DB" (analytics, counters, likes).
 *
 * We simulate the background worker with setInterval here — in production
 * use BullMQ, RabbitMQ, or an actual message queue.
 */
const WRITE_QUEUE = "queue:product:writes";

export async function getProduct(id: number): Promise<Product | null> {
  const cached = await redis.get(KEY.product(id));
  if (cached) return JSON.parse(cached) as Product;

  const fresh = await dbGetProduct(id);
  if (fresh) await redis.set(KEY.product(id), JSON.stringify(fresh), "EX", TTL.product);
  return fresh;
}

export async function updateProduct(id: number, patch: Partial<Product>): Promise<Product | null> {
  // 1. Read-modify-write against the cache (fast).
  const cachedRaw = await redis.get(KEY.product(id));
  const base: Product =
    cachedRaw !== null
      ? (JSON.parse(cachedRaw) as Product)
      : ((await dbGetProduct(id)) as Product);

  if (!base) return null;

  const updated: Product = { ...base, ...patch, id };
  await redis.set(KEY.product(id), JSON.stringify(updated), "EX", TTL.product);

  // 2. Enqueue a job — the actual DB write is deferred.
  await redis.rpush(WRITE_QUEUE, JSON.stringify({ id, patch }));

  return updated;
}

/** Background flusher — call once from your server bootstrap. */
export function startFlusher(intervalMs = 1000): NodeJS.Timeout {
  return setInterval(async () => {
    while (true) {
      const raw = await redis.lpop(WRITE_QUEUE);
      if (raw === null) break;
      try {
        const { id, patch } = JSON.parse(raw) as { id: number; patch: Partial<Product> };
        await dbUpdateProduct(id, patch);
      } catch (err) {
        console.error("[flusher] failed job, dropping:", err);
      }
    }
  }, intervalMs);
}

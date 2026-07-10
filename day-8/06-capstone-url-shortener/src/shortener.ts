import { customAlphabet } from "nanoid";
import { config } from "./config";
import { redis, K, today } from "./redis";
import { dbInsert, dbGet, UrlRecord } from "./db";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nano = customAlphabet(alphabet, config.codeLength);

function ttlWithJitter(base: number, jitter: number): number {
  return base + Math.floor(Math.random() * jitter);
}

/**
 * CREATE a short URL.
 * Retries on rare code collisions.
 * Owns Redis cache warming so the first redirect is a hit.
 */
export async function createShortUrl(target: string, owner: string): Promise<UrlRecord> {
  if (!/^https?:\/\//i.test(target)) {
    throw new Error("bad_target");
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = nano();
    const rec: UrlRecord = {
      code,
      target,
      owner,
      createdAt: new Date().toISOString(),
    };
    try {
      await dbInsert(rec);

      // Write-through: warm the read cache immediately
      await redis.set(
        K.urlCache(code),
        target,
        "EX",
        ttlWithJitter(config.cache.codeToUrlTtlSec, config.cache.codeToUrlJitterSec),
      );

      // Track ownership (for /me/urls endpoint)
      await redis.sadd(K.ownerCodes(owner), code);

      return rec;
    } catch (err) {
      if ((err as Error).message === "code_collision") continue;
      throw err;
    }
  }
  throw new Error("collision_exhausted");
}

/**
 * RESOLVE a short code to a target URL.
 * Cache-aside + negative cache to protect DB from missing-code storms.
 */
export async function resolveCode(code: string): Promise<string | null> {
  // 1) Positive cache
  const hit = await redis.get(K.urlCache(code));
  if (hit) return hit;

  // 2) Negative cache — remembers "not found" briefly to survive 404 floods
  const missMarker = await redis.get(K.neg(code));
  if (missMarker) return null;

  // 3) Source of truth
  const rec = await dbGet(code);
  if (!rec) {
    await redis.set(K.neg(code), "1", "EX", config.cache.negativeCacheTtlSec);
    return null;
  }

  // 4) Warm the cache
  await redis.set(
    K.urlCache(code),
    rec.target,
    "EX",
    ttlWithJitter(config.cache.codeToUrlTtlSec, config.cache.codeToUrlJitterSec),
  );
  return rec.target;
}

/**
 * INCREMENT click counters. Write-behind style — the redirect must never wait.
 * We deliberately do NOT await this from the redirect handler.
 */
export async function recordClickFireAndForget(code: string): Promise<void> {
  const day = today();
  redis
    .pipeline()
    .incr(K.clicksTotal(code))
    .incr(K.clicksByDay(code, day))
    .exec()
    .catch((err) => console.error("[analytics]", err.message));
}

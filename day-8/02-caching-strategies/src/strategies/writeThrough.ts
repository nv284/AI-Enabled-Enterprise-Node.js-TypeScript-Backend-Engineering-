import { redis, KEY, TTL } from "../cache";
import { dbGetProduct, dbUpdateProduct, Product } from "../db";

/**
 * WRITE-THROUGH
 *
 * Writes: app -> db -> cache (both must succeed)
 * Reads:  app -> cache -> if miss -> db -> write cache -> return  (same as cache-aside)
 *
 * Pros: cache is (almost) always warm and correct.
 * Cons: writes are slower (two hops). Cache stores unread data too.
 * Use when: read-after-write consistency matters (edit-then-view screens).
 */
export async function getProduct(id: number): Promise<Product | null> {
  const cached = await redis.get(KEY.product(id));
  if (cached) return JSON.parse(cached) as Product;

  const fresh = await dbGetProduct(id);
  if (fresh) await redis.set(KEY.product(id), JSON.stringify(fresh), "EX", TTL.product);
  return fresh;
}

export async function updateProduct(id: number, patch: Partial<Product>): Promise<Product | null> {
  const updated = await dbUpdateProduct(id, patch);
  if (updated) {
    // Rewrite the cache in the same request, so the very next read is a hit.
    await redis.set(KEY.product(id), JSON.stringify(updated), "EX", TTL.product);
  }
  await redis.del(KEY.productList()); // list is now stale
  return updated;
}

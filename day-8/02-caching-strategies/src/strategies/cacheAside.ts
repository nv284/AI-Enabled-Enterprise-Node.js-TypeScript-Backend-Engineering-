import { redis, KEY, TTL } from "../cache";
import { dbGetProduct, dbUpdateProduct, Product } from "../db";

/**
 * CACHE-ASIDE (aka "lazy loading")
 *
 * Reads:  app -> cache -> if miss -> db -> write cache -> return
 * Writes: app -> db    -> INVALIDATE cache (do NOT rewrite)
 *
 * Pros: simple, only cache what's actually read, resilient to cache outage.
 * Cons: first read is slow (cold cache).
 */
export async function getProduct(id: number): Promise<Product | null> {
  const cached = await redis.get(KEY.product(id));
  if (cached) {
    return JSON.parse(cached) as Product;
  }

  const fresh = await dbGetProduct(id);
  if (fresh) {
    await redis.set(KEY.product(id), JSON.stringify(fresh), "EX", TTL.product);
  }
  return fresh;
}

export async function updateProduct(id: number, patch: Partial<Product>): Promise<Product | null> {
  const updated = await dbUpdateProduct(id, patch);
  // Invalidate — never rewrite on write. Next read repopulates.
  await redis.del(KEY.product(id));
  await redis.del(KEY.productList());
  return updated;
}

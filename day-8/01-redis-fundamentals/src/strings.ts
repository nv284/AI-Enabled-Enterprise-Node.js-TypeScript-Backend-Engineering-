import { redis, closeRedis } from "./client";

/**
 * STRINGS — the simplest Redis type.
 * Think: `Map<string, string>` on steroids, with TTL and atomic counters.
 */
async function main() {
  console.log("--- SET / GET ---");
  await redis.set("user:1:name", "Ada Lovelace");
  console.log(await redis.get("user:1:name")); // Ada Lovelace

  console.log("\n--- SETEX (set with TTL in seconds) ---");
  await redis.setex("session:abc", 10, "user-1-token");
  console.log("TTL(session:abc) =", await redis.ttl("session:abc"), "seconds");

  console.log("\n--- INCR (atomic counter) ---");
  await redis.del("visits");
  await redis.incr("visits");
  await redis.incr("visits");
  await redis.incrby("visits", 10);
  console.log("visits =", await redis.get("visits")); // 12

  console.log("\n--- MSET / MGET (bulk) ---");
  await redis.mset({
    "product:1:name": "Book",
    "product:2:name": "Pen",
    "product:3:name": "Notebook",
  });
  console.log(await redis.mget("product:1:name", "product:2:name", "product:3:name"));

  console.log("\n--- SET NX (only if not exists — the lock pattern) ---");
  const first = await redis.set("lock:order-42", "worker-1", "EX", 5, "NX");
  const second = await redis.set("lock:order-42", "worker-2", "EX", 5, "NX");
  console.log("first attempt  =", first); // "OK"
  console.log("second attempt =", second); // null (someone already holds it)

  await closeRedis();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { redis, closeRedis } from "./client";

/**
 * TTL — Time To Live. The single most important idea for caching.
 * A key with a TTL is auto-deleted by Redis when it expires. No cron job needed.
 */
async function main() {
  console.log("--- EXPIRE on an existing key ---");
  await redis.set("otp:9876543210", "482913");
  await redis.expire("otp:9876543210", 30); // 30 seconds
  console.log("TTL =", await redis.ttl("otp:9876543210"), "seconds");

  console.log("\n--- SET with EX (in one shot) ---");
  await redis.set("cache:product:1", JSON.stringify({ id: 1, name: "Book" }), "EX", 60);
  console.log("TTL =", await redis.ttl("cache:product:1"));

  console.log("\n--- PERSIST (remove TTL) ---");
  await redis.persist("cache:product:1");
  console.log("TTL after persist =", await redis.ttl("cache:product:1")); // -1 means "no TTL"

  console.log("\n--- What -1 vs -2 mean ---");
  console.log("TTL of missing key =", await redis.ttl("does-not-exist")); // -2 means "key missing"

  console.log("\n--- Watch a key expire live (5s) ---");
  await redis.set("temp:heartbeat", "alive", "EX", 5);
  for (let i = 0; i < 7; i++) {
    const ttl = await redis.ttl("temp:heartbeat");
    const val = await redis.get("temp:heartbeat");
    console.log(`t=${i}s  ttl=${ttl}  value=${val ?? "(gone)"}`);
    await new Promise((r) => setTimeout(r, 1000));
  }

  await closeRedis();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

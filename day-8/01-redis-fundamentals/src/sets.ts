import { redis, closeRedis } from "./client";

/**
 * SETS — unordered, unique members.
 * Perfect for "tags", "unique visitors today", "friends of X".
 */
async function main() {
  await redis.del("post:1:tags", "post:2:tags");

  console.log("--- SADD / SMEMBERS ---");
  await redis.sadd("post:1:tags", "redis", "cache", "backend");
  await redis.sadd("post:2:tags", "cache", "frontend", "react");
  console.log(await redis.smembers("post:1:tags"));

  console.log("\n--- SINTER (common tags) ---");
  console.log(await redis.sinter("post:1:tags", "post:2:tags")); // ['cache']

  console.log("\n--- SISMEMBER (fast contains) ---");
  console.log("has redis?", await redis.sismember("post:1:tags", "redis")); // 1
  console.log("has vue?  ", await redis.sismember("post:1:tags", "vue")); // 0

  console.log("\n--- SCARD (count) ---");
  console.log("post:1 has", await redis.scard("post:1:tags"), "tags");

  await closeRedis();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { redis, closeRedis } from "./client";

/**
 * SORTED SETS (zset) — unique members with a numeric score.
 * The Swiss-army knife for leaderboards, "top N", rate limiters, and time-series windows.
 */
async function main() {
  await redis.del("leaderboard:2026");

  console.log("--- ZADD ---");
  await redis.zadd("leaderboard:2026", 120, "alice", 340, "bob", 90, "chen", 500, "dev");

  console.log("\n--- ZREVRANGE 0..2 WITHSCORES (top 3) ---");
  const top3 = await redis.zrevrange("leaderboard:2026", 0, 2, "WITHSCORES");
  console.log(top3); // ['dev','500','bob','340','alice','120']

  console.log("\n--- ZINCRBY (bump a score) ---");
  await redis.zincrby("leaderboard:2026", 200, "chen");
  console.log("chen new score =", await redis.zscore("leaderboard:2026", "chen"));

  console.log("\n--- ZRANK (rank, 0-based, ascending) ---");
  console.log("bob rank =", await redis.zrank("leaderboard:2026", "bob"));
  console.log("bob rev-rank =", await redis.zrevrank("leaderboard:2026", "bob"));

  console.log("\n--- Sliding window preview (used in Module 03) ---");
  const now = Date.now();
  await redis.del("hits:ip-1.2.3.4");
  await redis.zadd("hits:ip-1.2.3.4", now - 5000, "req-a");
  await redis.zadd("hits:ip-1.2.3.4", now - 2000, "req-b");
  await redis.zadd("hits:ip-1.2.3.4", now, "req-c");
  // remove requests older than "now - 3000 ms" (i.e. last 3 seconds only)
  await redis.zremrangebyscore("hits:ip-1.2.3.4", 0, now - 3000);
  console.log("requests in last 3s =", await redis.zcard("hits:ip-1.2.3.4"));

  await closeRedis();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

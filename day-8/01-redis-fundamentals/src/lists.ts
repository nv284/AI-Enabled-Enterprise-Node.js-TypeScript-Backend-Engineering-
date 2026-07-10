import { redis, closeRedis } from "./client";

/**
 * LISTS — ordered, duplicates allowed.
 * Great for queues, recent-N caches, activity feeds.
 */
async function main() {
  await redis.del("recent:searches");

  console.log("--- LPUSH (push to head) ---");
  await redis.lpush("recent:searches", "redis");
  await redis.lpush("recent:searches", "ttl");
  await redis.lpush("recent:searches", "cache-aside");
  console.log(await redis.lrange("recent:searches", 0, -1));
  // ['cache-aside', 'ttl', 'redis']

  console.log("\n--- Keep only latest 5 (LPUSH + LTRIM = capped list) ---");
  for (const term of ["hash", "zset", "list", "string", "set", "stream", "geo"]) {
    await redis.lpush("recent:searches", term);
    await redis.ltrim("recent:searches", 0, 4); // keep newest 5
  }
  console.log(await redis.lrange("recent:searches", 0, -1));

  console.log("\n--- RPOP as a simple work queue ---");
  await redis.del("jobs");
  await redis.rpush("jobs", "send-email:1", "resize-image:2", "send-email:3");
  let job: string | null;
  while ((job = await redis.lpop("jobs")) !== null) {
    console.log("worker got job:", job);
  }

  await closeRedis();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

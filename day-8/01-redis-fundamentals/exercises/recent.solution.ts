import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

async function search(userId: string, term: string): Promise<void> {
  const key = `recent:${userId}`;
  await redis.lrem(key, 0, term); // remove old occurrences
  await redis.lpush(key, term);   // push to head
  await redis.ltrim(key, 0, 4);   // keep newest 5
}

async function main() {
  await redis.del("recent:u1");

  const terms = ["redis", "cache", "ttl", "zset", "hash", "list", "sets", "pipeline", "redis"];
  for (const t of terms) await search("u1", t);

  console.log(await redis.lrange("recent:u1", 0, -1));

  await redis.quit();
}

main().catch(console.error);

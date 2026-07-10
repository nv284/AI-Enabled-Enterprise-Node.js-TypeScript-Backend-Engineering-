import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

async function record(path: string): Promise<void> {
  // TODO 1: INCR pageviews:<path>
  // TODO 2: ZINCRBY pageviews:_index 1 <path>
}

async function top(n: number): Promise<Array<{ path: string; count: number }>> {
  // TODO: ZREVRANGE pageviews:_index 0 (n-1) WITHSCORES
  return [];
}

async function main() {
  const hits: Array<[string, number]> = [
    ["/home", 5],
    ["/about", 1],
    ["/pricing", 3],
    ["/blog", 8],
  ];

  for (const [path, times] of hits) {
    for (let i = 0; i < times; i++) await record(path);
  }

  const t = await top(3);
  t.forEach((r, i) => console.log(`${i + 1}. ${r.path} -> ${r.count}`));

  await redis.quit();
}

main().catch(console.error);

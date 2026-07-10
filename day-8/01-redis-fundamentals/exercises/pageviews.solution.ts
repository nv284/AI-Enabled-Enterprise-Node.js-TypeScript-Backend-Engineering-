import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

async function record(path: string): Promise<void> {
  await redis.incr(`pageviews:${path}`);
  await redis.zincrby("pageviews:_index", 1, path);
}

async function top(n: number): Promise<Array<{ path: string; count: number }>> {
  const raw = await redis.zrevrange("pageviews:_index", 0, n - 1, "WITHSCORES");
  const out: Array<{ path: string; count: number }> = [];
  for (let i = 0; i < raw.length; i += 2) {
    out.push({ path: raw[i], count: Number(raw[i + 1]) });
  }
  return out;
}

async function main() {
  await redis.del("pageviews:_index");
  for (const p of ["/home", "/about", "/pricing", "/blog"]) {
    await redis.del(`pageviews:${p}`);
  }

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

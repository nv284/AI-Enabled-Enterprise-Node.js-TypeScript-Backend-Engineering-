export const config = {
  port: Number(process.env.PORT ?? 3006),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  dbLatencyMs: Number(process.env.DB_LATENCY_MS ?? 100),
  codeLength: 7,
  cache: {
    codeToUrlTtlSec: 60 * 60,        // 1 hour — codes are near-immutable
    codeToUrlJitterSec: 5 * 60,      // ±5 min jitter to avoid stampede
    negativeCacheTtlSec: 30,         // remember "not found" for 30 s
    analyticsTtlSec: 60,             // owner analytics — 1 min freshness
  },
  rateLimit: {
    shorten: { points: 20, duration: 60 },      // 20 creates / min / ip
    redirect: { points: 300, duration: 60 },    // 300 redirects / min / ip
    analytics: { points: 60, duration: 60 },    // 60 reads / min / owner
  },
};

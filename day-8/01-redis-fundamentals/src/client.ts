import Redis from "ioredis";

/**
 * Single shared client for the module.
 * Reads REDIS_URL if set, else falls back to local docker.
 */
export const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

redis.on("error", (err) => {
  console.error("[redis] error:", err.message);
});

export async function closeRedis(): Promise<void> {
  await redis.quit();
}

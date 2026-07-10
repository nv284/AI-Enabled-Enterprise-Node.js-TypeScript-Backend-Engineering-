import Redis from "ioredis";

// `enableOfflineQueue: false` makes rate-limiter-flexible fail fast if Redis is down,
// instead of buffering requests that will then all fire when Redis comes back.
export const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  enableOfflineQueue: false,
});

redis.on("error", (err) => console.error("[redis]", err.message));

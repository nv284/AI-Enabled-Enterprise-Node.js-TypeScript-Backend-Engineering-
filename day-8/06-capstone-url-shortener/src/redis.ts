import Redis from "ioredis";
import { config } from "./config";

export const redis = new Redis(config.redisUrl, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
});

redis.on("error", (err) => console.error("[redis]", err.message));

/**
 * Key layout — all cache/data keys live here.
 * The `s:` prefix keeps our namespace short and greppable.
 */
export const K = {
  url: (code: string) => `s:url:${code}`,           // string — target URL (source of truth surrogate)
  urlCache: (code: string) => `s:cache:url:${code}`,// cache-aside key
  clicksTotal: (code: string) => `s:clicks:${code}`,// integer counter
  clicksByDay: (code: string, day: string) => `s:clicks:${code}:${day}`, // per-day counter
  ownerCodes: (owner: string) => `s:owner:${owner}`,// set of codes owned by an "user"
  neg: (code: string) => `s:neg:${code}`,           // negative cache marker
};

export function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { redis } from "../redis";

/**
 * PER-USER rate limiter (authenticated).
 * Different tiers get different budgets.
 *
 * Key = user tier + user id.
 * Anonymous users fall back to their IP.
 */
const perTier = {
  free:  new RateLimiterRedis({ storeClient: redis, keyPrefix: "rl:free",  points: 10, duration: 60 }),
  pro:   new RateLimiterRedis({ storeClient: redis, keyPrefix: "rl:pro",   points: 100, duration: 60 }),
} as const;

export type Tier = keyof typeof perTier;

export function perUser(getUser: (req: Request) => { id: string; tier: Tier } | null) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = getUser(req);
    const key = user ? `${user.tier}:${user.id}` : `anon:${req.ip ?? "unknown"}`;
    const limiter = user ? perTier[user.tier] : perTier.free;

    try {
      const r = await limiter.consume(key, 1);
      res.set("RateLimit-Limit", String(user ? (user.tier === "pro" ? 100 : 10) : 10));
      res.set("RateLimit-Remaining", String(Math.max(0, r.remainingPoints)));
      next();
    } catch (err) {
      if (err instanceof RateLimiterRes) {
        res.status(429).json({
          error: "rate_limited",
          tier: user?.tier ?? "anon",
          retryAfterSeconds: Math.ceil(err.msBeforeNext / 1000),
        });
        return;
      }
      next(err as Error);
    }
  };
}

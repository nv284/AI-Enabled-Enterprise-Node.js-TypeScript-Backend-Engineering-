import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { redis } from "../redis";
import { config } from "../config";

function build(keyPrefix: string, points: number, duration: number) {
  return new RateLimiterRedis({ storeClient: redis, keyPrefix, points, duration });
}

const limiters = {
  shorten: build("rl:shorten", config.rateLimit.shorten.points, config.rateLimit.shorten.duration),
  redirect: build("rl:redirect", config.rateLimit.redirect.points, config.rateLimit.redirect.duration),
  analytics: build("rl:analytics", config.rateLimit.analytics.points, config.rateLimit.analytics.duration),
};

export type LimiterName = keyof typeof limiters;

export function rateLimit(name: LimiterName, getKey?: (req: Request) => string) {
  const limiter = limiters[name];
  const cfg = config.rateLimit[name];

  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const key = (getKey ? getKey(req) : req.ip) ?? "unknown";
    try {
      const r = await limiter.consume(key, 1);
      res.set("RateLimit-Limit", String(cfg.points));
      res.set("RateLimit-Remaining", String(Math.max(0, r.remainingPoints)));
      res.set("RateLimit-Reset", String(Math.ceil(r.msBeforeNext / 1000)));
      next();
    } catch (err) {
      if (err instanceof RateLimiterRes) {
        res.status(429).json({
          error: "rate_limited",
          limiter: name,
          retryAfterSeconds: Math.ceil(err.msBeforeNext / 1000),
        });
        return;
      }
      next(err as Error);
    }
  };
}

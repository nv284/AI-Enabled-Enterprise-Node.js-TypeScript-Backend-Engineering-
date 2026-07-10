import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { redis } from "../redis";

/**
 * FIXED-WINDOW rate limiter.
 * "Max N requests per <duration> seconds per key" — the window resets sharply.
 *
 * Simple, cheap, but allows a burst of 2N at the boundary (last second of one
 * window + first second of the next).
 */
const limiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:fixed",
  points: 5,        // 5 requests
  duration: 10,     // per 10 seconds
});

export async function fixedWindow(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const key = req.ip ?? "unknown";
  try {
    const r = await limiter.consume(key, 1);
    setStandardHeaders(res, r, 5);
    next();
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      setStandardHeaders(res, err, 5);
      res.status(429).json({
        error: "rate_limited",
        retryAfterSeconds: Math.ceil(err.msBeforeNext / 1000),
      });
      return;
    }
    next(err as Error);
  }
}

function setStandardHeaders(res: Response, r: RateLimiterRes, max: number): void {
  res.set("RateLimit-Limit", String(max));
  res.set("RateLimit-Remaining", String(Math.max(0, r.remainingPoints)));
  res.set("RateLimit-Reset", String(Math.ceil(r.msBeforeNext / 1000)));
}

import { Request, Response, NextFunction } from "express";
import { redis } from "../redis";

/**
 * SLIDING-WINDOW rate limiter — hand-rolled with a Redis sorted set.
 *
 * "At any point in time, allow at most N requests in the last W seconds."
 * No burst-at-boundary problem, but slightly more Redis work per request.
 *
 * Algorithm (per request):
 *   1) member = unique id (timestamp + rand)
 *   2) ZADD hits:<key> <now-ms> <member>
 *   3) ZREMRANGEBYSCORE hits:<key> 0 (now - windowMs)   // drop old
 *   4) ZCARD hits:<key>                                  // count what's left
 *   5) EXPIRE hits:<key> <windowSec>                     // auto-cleanup idle keys
 *   6) if count > max -> 429
 *
 * All 5 commands are batched in a single pipeline for one round-trip.
 */
type Options = {
  points: number;    // max requests
  windowMs: number;  // sliding window size
  keyPrefix?: string;
};

export function slidingWindow(opts: Options) {
  const keyPrefix = opts.keyPrefix ?? "rl:sliding";

  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const key = `${keyPrefix}:${req.ip ?? "unknown"}`;
    const now = Date.now();
    const member = `${now}-${Math.random().toString(36).slice(2)}`;
    const windowSec = Math.ceil(opts.windowMs / 1000);

    const [, , countReply] = (await redis
      .pipeline()
      .zadd(key, now, member)
      .zremrangebyscore(key, 0, now - opts.windowMs)
      .zcard(key)
      .expire(key, windowSec)
      .exec()) as [unknown, unknown, [null, number], unknown];

    const count = countReply[1];
    const remaining = Math.max(0, opts.points - count);

    res.set("RateLimit-Limit", String(opts.points));
    res.set("RateLimit-Remaining", String(remaining));
    res.set("RateLimit-Reset", String(windowSec));

    if (count > opts.points) {
      // Optional: drop the entry we just added to keep the set clean
      await redis.zrem(key, member);
      res.status(429).json({
        error: "rate_limited",
        retryAfterSeconds: windowSec,
      });
      return;
    }

    next();
  };
}

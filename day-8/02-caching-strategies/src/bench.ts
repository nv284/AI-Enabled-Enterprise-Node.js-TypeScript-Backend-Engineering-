import { redis } from "./cache";
import * as aside from "./strategies/cacheAside";

/**
 * Tiny in-process benchmark: N reads of the same product.
 * Round 1 is a cache miss, rounds 2..N should be cache hits and much faster.
 */
async function main() {
  const N = 20;

  // Clear cache so round 1 is a miss
  await redis.del("cache:product:1");

  console.log(`Running ${N} sequential getProduct(1) calls...`);
  const times: number[] = [];
  for (let i = 0; i < N; i++) {
    const t0 = Date.now();
    await aside.getProduct(1);
    times.push(Date.now() - t0);
  }

  const [first, ...rest] = times;
  const avgRest = rest.reduce((a, b) => a + b, 0) / rest.length;
  console.log(`round 1 (miss)     : ${first} ms`);
  console.log(`rounds 2..${N} avg : ${avgRest.toFixed(1)} ms`);
  console.log(`speed-up           : ~${(first / avgRest).toFixed(1)}x`);

  await redis.quit();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

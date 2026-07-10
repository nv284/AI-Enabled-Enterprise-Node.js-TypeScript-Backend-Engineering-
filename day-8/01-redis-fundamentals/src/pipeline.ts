import { redis, closeRedis } from "./client";

/**
 * PIPELINE — batch many commands in one network round-trip.
 * The single biggest, easiest perf win once you talk to Redis in a hot loop.
 */
async function main() {
  const N = 1000;

  // Naive: 1000 separate round-trips
  console.time("naive");
  for (let i = 0; i < N; i++) {
    await redis.set(`bench:naive:${i}`, i.toString());
  }
  console.timeEnd("naive");

  // Pipeline: 1 round-trip
  console.time("pipeline");
  const pipe = redis.pipeline();
  for (let i = 0; i < N; i++) {
    pipe.set(`bench:pipe:${i}`, i.toString());
  }
  await pipe.exec();
  console.timeEnd("pipeline");

  // Clean up
  const keys = await redis.keys("bench:*");
  if (keys.length) await redis.del(...keys);

  await closeRedis();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

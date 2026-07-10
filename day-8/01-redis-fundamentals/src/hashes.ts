import { redis, closeRedis } from "./client";

/**
 * HASHES — a `Map<string, string>` stored under one key.
 * Great for representing a single "record" (user, product, session).
 */
async function main() {
  console.log("--- HSET / HGETALL ---");
  await redis.hset("user:42", {
    name: "Grace Hopper",
    email: "grace@navy.mil",
    role: "admiral",
  });

  const record = await redis.hgetall("user:42");
  console.log(record);
  // { name: 'Grace Hopper', email: 'grace@navy.mil', role: 'admiral' }

  console.log("\n--- HGET one field ---");
  console.log(await redis.hget("user:42", "email"));

  console.log("\n--- HINCRBY (atomic per-field counter) ---");
  await redis.hset("user:42:stats", "logins", "0");
  await redis.hincrby("user:42:stats", "logins", 1);
  await redis.hincrby("user:42:stats", "logins", 1);
  console.log("logins =", await redis.hget("user:42:stats", "logins")); // 2

  console.log("\n--- HDEL (remove a field) ---");
  await redis.hdel("user:42", "role");
  console.log(await redis.hgetall("user:42"));

  await closeRedis();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

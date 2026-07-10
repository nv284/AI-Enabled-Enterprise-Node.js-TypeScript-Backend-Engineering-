import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

redis.on("error", (err) => console.error("[redis]", err.message));

export const KEY = {
  product: (id: number) => `cache:product:${id}`,
  productList: () => `cache:product:list`,
};

export const TTL = {
  product: 60,        // seconds
  productList: 30,
};

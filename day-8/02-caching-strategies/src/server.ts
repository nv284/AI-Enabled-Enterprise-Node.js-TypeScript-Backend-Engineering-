import express, { Request, Response } from "express";
import { redis } from "./cache";
import * as aside from "./strategies/cacheAside";
import * as through from "./strategies/writeThrough";
import * as behind from "./strategies/writeBehind";
import { dbListProducts } from "./db";

const app = express();
app.use(express.json());

/**
 * We expose the SAME resource under 3 prefixes so you can hit each strategy
 * with `.http` files and see the timing / behaviour difference.
 */
const strategies = {
  "/aside": aside,
  "/through": through,
  "/behind": behind,
} as const;

for (const [prefix, impl] of Object.entries(strategies)) {
  app.get(`${prefix}/products/:id`, async (req: Request, res: Response) => {
    const t0 = Date.now();
    const p = await impl.getProduct(Number(req.params.id));
    const ms = Date.now() - t0;
    if (!p) return res.status(404).json({ error: "not found", ms });
    res.set("x-cache-latency-ms", String(ms));
    res.json({ product: p, latencyMs: ms });
  });

  app.patch(`${prefix}/products/:id`, async (req: Request, res: Response) => {
    const t0 = Date.now();
    const p = await impl.updateProduct(Number(req.params.id), req.body);
    const ms = Date.now() - t0;
    if (!p) return res.status(404).json({ error: "not found", ms });
    res.json({ product: p, latencyMs: ms });
  });
}

/**
 * Shared list endpoint using cache-aside (independent of the 3 prefixes above)
 * so participants can see list-level invalidation.
 */
app.get("/products", async (_req, res) => {
  const t0 = Date.now();
  const cached = await redis.get("cache:product:list");
  if (cached) {
    return res.json({ products: JSON.parse(cached), source: "cache", latencyMs: Date.now() - t0 });
  }
  const list = await dbListProducts();
  await redis.set("cache:product:list", JSON.stringify(list), "EX", 30);
  res.json({ products: list, source: "db", latencyMs: Date.now() - t0 });
});

// Small helper: peek at any cache key from the browser
app.get("/_cache/*", async (req, res) => {
  const key = req.params[0];
  const v = await redis.get(key);
  const ttl = await redis.ttl(key);
  res.json({ key, ttl, value: v });
});

// Start write-behind flusher
behind.startFlusher(1000);

const PORT = Number(process.env.PORT ?? 3002);
app.listen(PORT, () => {
  console.log(`caching demo on http://localhost:${PORT}`);
  console.log("Try:  GET /aside/products/1   (twice)");
  console.log("Try:  PATCH /through/products/1  {\"price\": 999}");
});

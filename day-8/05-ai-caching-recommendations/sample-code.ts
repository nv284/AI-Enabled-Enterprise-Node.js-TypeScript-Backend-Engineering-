/**
 * Sample "product detail" endpoint for AI review.
 *
 * Traffic profile (assume this in your prompt):
 *   - 500 reads/min at peak
 *   - 5 writes/min (admin edits price/stock)
 *   - Response ~2 KB JSON
 *   - Price can be stale up to 30 s (business tolerance)
 *
 * DO NOT "fix" this file. Your job is to REVIEW it with AI, then in
 * capstone-plan.md, describe what you'd change and why.
 */
import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

type Product = { id: number; name: string; price: number; stock: number };

async function slowDbGetProduct(id: number): Promise<Product | null> {
  await new Promise((r) => setTimeout(r, 80)); // simulate ~80ms SQL
  return { id, name: `Product ${id}`, price: 199.99, stock: 42 };
}
async function slowDbListReviews(productId: number): Promise<Array<{ id: number; text: string }>> {
  await new Promise((r) => setTimeout(r, 120));
  return Array.from({ length: 10 }, (_, i) => ({ id: i + 1, text: `Review ${i + 1} for ${productId}` }));
}
async function slowDbUpdateProduct(id: number, patch: Partial<Product>): Promise<Product> {
  await new Promise((r) => setTimeout(r, 100));
  return { id, name: "x", price: 0, stock: 0, ...patch };
}

// ---------- The endpoint(s) under review ----------

app.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  // Two sequential DB calls per request
  const product = await slowDbGetProduct(id);
  const reviews = await slowDbListReviews(id);

  // Cache attempt — but key includes a per-request random and TTL is huge
  await redis.set(
    `product:${id}:${Math.random()}`,
    JSON.stringify({ product, reviews }),
    "EX",
    60 * 60 * 24 * 7,
  );

  // Related products loop (N+1 to Redis)
  const relatedIds = [id + 1, id + 2, id + 3, id + 4, id + 5];
  const related: Array<Product | null> = [];
  for (const rid of relatedIds) {
    const raw = await redis.get(`product:${rid}`);
    related.push(raw ? (JSON.parse(raw) as Product) : null);
  }

  res.json({ product, reviews, related });
});

app.patch("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updated = await slowDbUpdateProduct(id, req.body);

  // No cache invalidation at all — stale for a week per the SET above.

  res.json(updated);
});

app.get("/products", async (_req, res) => {
  // No pagination, no cache
  const list: Product[] = [];
  for (let id = 1; id <= 500; id++) {
    const p = await slowDbGetProduct(id); // 500 × 80 ms
    list.push(p!);
  }
  res.json({ count: list.length, products: list });
});

// No rate limiting anywhere.

const PORT = Number(process.env.PORT ?? 3005);
app.listen(PORT, () => console.log(`sample under review on http://localhost:${PORT}`));

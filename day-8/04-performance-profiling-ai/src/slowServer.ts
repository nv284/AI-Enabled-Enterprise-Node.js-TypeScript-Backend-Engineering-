import express, { Request, Response } from "express";
import Redis from "ioredis";
import { createHash } from "node:crypto";

/**
 * A deliberately-slow Express app with a mix of realistic pain points.
 * The point of this module is to FIND these smells with tools, not read the code.
 * Try not to look at the source until AFTER the AI analysis step.
 */
const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

// ---------- Fake DB ----------
type Product = { id: number; name: string; description: string; price: number };
const DB: Product[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  description: "Lorem ipsum ".repeat(20),
  price: Math.round(Math.random() * 10000) / 100,
}));

function fakeDbLatency(): Promise<void> {
  // 30 – 80 ms — a normal-ish SQL query
  return new Promise((r) => setTimeout(r, 30 + Math.random() * 50));
}

// ---------- Smell 1: no caching on a hot endpoint ----------
app.get("/hot", async (_req, res) => {
  await fakeDbLatency();
  res.json({ products: DB.slice(0, 20) });
});

// ---------- Smell 2: sync CPU work on the event loop ----------
app.get("/cpu", async (_req, res) => {
  // 15k rounds of sha256 — blocks the event loop for a while
  let h = "seed";
  for (let i = 0; i < 15_000; i++) {
    h = createHash("sha256").update(h).digest("hex");
  }
  res.json({ hash: h });
});

// ---------- Smell 3: N+1 to Redis (no pipeline) ----------
app.get("/n-plus-1", async (_req, res) => {
  const ids = DB.slice(0, 50).map((p) => p.id);
  const results: Array<string | null> = [];
  for (const id of ids) {
    results.push(await redis.get(`cache:hot:${id}`)); // 50 round-trips
  }
  res.json({ hits: results.filter((v) => v !== null).length, misses: results.filter((v) => v === null).length });
});

// ---------- Smell 4: no pagination, huge JSON ----------
app.get("/all", async (_req, res) => {
  await fakeDbLatency();
  res.json({ products: DB, count: DB.length });
});

// ---------- Smell 5: broken cache — key encodes a timestamp (never hits) ----------
app.get("/broken-cache/:id", async (req, res) => {
  const key = `cache:${req.params.id}:${Date.now()}`; // ← different key every request
  let json = await redis.get(key);
  if (!json) {
    await fakeDbLatency();
    const p = DB.find((x) => x.id === Number(req.params.id));
    json = JSON.stringify(p ?? null);
    await redis.set(key, json, "EX", 60);
  }
  res.json(JSON.parse(json));
});

// ---------- A working baseline for comparison ----------
app.get("/good/:id", async (req, res) => {
  const key = `cache:good:${req.params.id}`;
  const cached = await redis.get(key);
  if (cached) return res.json(JSON.parse(cached));
  await fakeDbLatency();
  const p = DB.find((x) => x.id === Number(req.params.id)) ?? null;
  await redis.set(key, JSON.stringify(p), "EX", 60);
  res.json(p);
});

const PORT = Number(process.env.PORT ?? 3004);
app.listen(PORT, () => {
  console.log(`slow demo on http://localhost:${PORT}`);
  console.log("Endpoints:  /hot  /cpu  /n-plus-1  /all  /broken-cache/1  /good/1");
});

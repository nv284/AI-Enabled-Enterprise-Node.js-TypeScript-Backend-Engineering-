import express from "express";
import { fixedWindow } from "./middleware/fixedWindow";
import { slidingWindow } from "./middleware/slidingWindow";
import { perUser, Tier } from "./middleware/perUser";

const app = express();
app.use(express.json());

// Trust localhost / dev proxy so req.ip works nicely
app.set("trust proxy", true);

app.get("/", (_req, res) => {
  res.json({
    endpoints: {
      "/fixed":   "5 req / 10 s (fixed window)",
      "/sliding": "5 req / 10 s (sliding window)",
      "/api":     "tier-based (free=10/min, pro=100/min). Send header x-user-id and x-tier",
      "/open":    "no limit",
    },
  });
});

app.get("/open", (_req, res) => res.json({ ok: true }));

app.get("/fixed", fixedWindow, (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

app.get(
  "/sliding",
  slidingWindow({ points: 5, windowMs: 10_000 }),
  (_req, res) => res.json({ ok: true, at: new Date().toISOString() }),
);

app.get(
  "/api",
  perUser((req) => {
    const id = req.header("x-user-id");
    const tier = (req.header("x-tier") as Tier) ?? "free";
    return id ? { id, tier } : null;
  }),
  (req, res) =>
    res.json({
      ok: true,
      user: req.header("x-user-id") ?? "(anon)",
      tier: req.header("x-tier") ?? "free/anon",
    }),
);

const PORT = Number(process.env.PORT ?? 3003);
app.listen(PORT, () => {
  console.log(`rate-limit demo on http://localhost:${PORT}`);
});

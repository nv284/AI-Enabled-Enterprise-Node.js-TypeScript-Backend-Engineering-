import express, { Request, Response } from "express";
import { config } from "./config";
import { redis, K } from "./redis";
import { createShortUrl, resolveCode, recordClickFireAndForget } from "./shortener";
import { getAnalytics } from "./analytics";
import { rateLimit } from "./middleware/rateLimit";
import { fakeAuth, requireOwner } from "./middleware/auth";

const app = express();
app.use(express.json());
app.set("trust proxy", true);
app.use(fakeAuth);

app.get("/", (_req, res) => {
  res.json({
    name: "URL shortener capstone",
    endpoints: {
      "POST /shorten":        "body: {target}, header x-user-id",
      "GET /:code":           "public redirect",
      "GET /me/urls":         "your codes (owner)",
      "GET /analytics/:code": "click stats (owner)",
      "DELETE /:code":        "remove a short URL (owner)",
      "GET /_stats":          "live cache + Redis stats",
    },
  });
});

// ---------- Create ----------
app.post(
  "/shorten",
  rateLimit("shorten"),
  async (req: Request, res: Response) => {
    const { target } = req.body as { target?: string };
    if (!target) return res.status(400).json({ error: "target_required" });

    const owner = (req as Request & { owner: string }).owner;
    try {
      const rec = await createShortUrl(target, owner);
      res.status(201).json({
        code: rec.code,
        shortUrl: `${req.protocol}://${req.get("host")}/${rec.code}`,
        target: rec.target,
      });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === "bad_target") return res.status(400).json({ error: "bad_target", hint: "must start with http(s)://" });
      throw err;
    }
  },
);

// ---------- Owner: list my codes ----------
app.get("/me/urls", requireOwner, async (req: Request, res: Response) => {
  const owner = (req as Request & { owner: string }).owner;
  const codes = await redis.smembers(K.ownerCodes(owner));
  res.json({ owner, count: codes.length, codes });
});

// ---------- Owner: analytics ----------
app.get(
  "/analytics/:code",
  requireOwner,
  rateLimit("analytics", (req) => (req as Request & { owner: string }).owner),
  async (req: Request, res: Response) => {
    const owner = (req as Request & { owner: string }).owner;
    const isOwner = await redis.sismember(K.ownerCodes(owner), req.params.code);
    if (!isOwner) return res.status(403).json({ error: "not_owner" });
    const stats = await getAnalytics(req.params.code, 7);
    res.json(stats);
  },
);

// ---------- Owner: delete ----------
app.delete("/:code", requireOwner, async (req: Request, res: Response) => {
  const owner = (req as Request & { owner: string }).owner;
  const isOwner = await redis.sismember(K.ownerCodes(owner), req.params.code);
  if (!isOwner) return res.status(403).json({ error: "not_owner" });

  await redis
    .pipeline()
    .srem(K.ownerCodes(owner), req.params.code)
    .del(K.urlCache(req.params.code))
    .del(K.clicksTotal(req.params.code))
    .exec();
  res.json({ deleted: req.params.code });
});

// ---------- Live stats (for the demo) ----------
app.get("/_stats", async (_req, res) => {
  const info = await redis.info("memory");
  const keyCount = await redis.dbsize();
  res.json({
    keys: keyCount,
    memory: /used_memory_human:(.*)/.exec(info)?.[1]?.trim(),
    port: config.port,
    dbLatencyMs: config.dbLatencyMs,
  });
});

// ---------- Public redirect (HOT PATH) ----------
// Register LAST so it doesn't shadow other routes.
app.get(
  "/:code",
  rateLimit("redirect"),
  async (req: Request, res: Response) => {
    const target = await resolveCode(req.params.code);
    if (!target) return res.status(404).json({ error: "code_not_found" });

    recordClickFireAndForget(req.params.code);
    res.redirect(302, target);
  },
);

app.listen(config.port, () => {
  console.log(`shortener on http://localhost:${config.port}`);
});

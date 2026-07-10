/**
 * Example 3 — access + refresh token pair with rotation.
 *
 * Access token: short-lived JWT.
 * Refresh token: opaque random string, hashed and stored server-side.
 *
 * Rotation: every /refresh returns a NEW refresh token and revokes the old one.
 *
 * Run: npx tsx 03-refresh-flow.ts
 */
import { randomBytes, createHash } from 'node:crypto';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = 'super-secret-training-key-change-me';
const app = express();
app.use(express.json());

// In-memory demo store. Real code: DB table (id, userId, tokenHash, expiresAt, revokedAt).
const refreshStore = new Map<string, { userId: string; expiresAt: number }>();

const hash = (s: string) => createHash('sha256').update(s).digest('hex');

function issueTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ sub: userId, role }, SECRET, {
    algorithm: 'HS256',
    expiresIn: '15m',
  });
  const refreshToken = randomBytes(48).toString('base64url');
  refreshStore.set(hash(refreshToken), {
    userId,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30d
  });
  return { accessToken, refreshToken };
}

app.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (email !== 'ada@x.com' || password !== 'pw') {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const tokens = issueTokens('42', 'user');
  res.json(tokens);
});

app.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) return res.status(400).json({ error: 'missing token' });

  const key = hash(refreshToken);
  const entry = refreshStore.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'invalid refresh token' });
  }

  // Rotate: revoke old, issue new pair.
  refreshStore.delete(key);
  const tokens = issueTokens(entry.userId, 'user');
  res.json(tokens);
});

app.post('/logout', (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  if (refreshToken) refreshStore.delete(hash(refreshToken));
  res.status(204).end();
});

app.listen(3002, () => console.log('http://localhost:3002'));

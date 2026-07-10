# Solutions — Module 1

## Ex 1 — Playground

- jwt.io can decode the payload because it is **base64url-encoded, not encrypted**. Anyone with the token can read it. That's why sensitive data must never go in the payload.
- The tampered token fails because the signature was computed over the **original** header+payload. Any change invalidates the signature.

## Ex 2 — authGuard

```ts
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'change-me-please';

interface AuthedRequest extends Request {
  user?: { sub: string; role: string };
}

export function authGuard(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (!token || scheme?.toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'unauthorized' });
  }

  try {
    const claims = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],
      issuer: 'notes-api',
      audience: 'notes-web',
      clockTolerance: 5,
    }) as JwtPayload;

    if (typeof claims.sub !== 'string' || typeof claims.role !== 'string') {
      return res.status(401).json({ error: 'unauthorized' });
    }
    req.user = { sub: claims.sub, role: claims.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}
```

**Discussion:**
- Why one generic error message? So attackers can't distinguish "token expired" from "signature invalid" from "wrong audience".
- Why `clockTolerance`? To survive small clock drift between servers.

## Ex 3 — Refresh rotation with reuse detection

Add `familyId` to the store:

```ts
type RefreshRecord = { userId: string; familyId: string; expiresAt: number };
const refreshStore = new Map<string, RefreshRecord>(); // key = hash(token)
const revokedFamilies = new Set<string>();

function issueTokens(userId: string, role: string, familyId = crypto.randomUUID()) {
  const refreshToken = crypto.randomBytes(48).toString('base64url');
  refreshStore.set(hash(refreshToken), { userId, familyId, expiresAt: Date.now() + THIRTY_DAYS });
  const accessToken = jwt.sign({ sub: userId, role }, SECRET, { algorithm: 'HS256', expiresIn: '15m' });
  return { accessToken, refreshToken, familyId };
}

app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) return res.status(400).json({ error: 'missing token' });
  const key = hash(refreshToken);
  const entry = refreshStore.get(key);

  if (!entry) {
    // Possibly a reused (already rotated) token — revoke everything in that family.
    // Since we don't know the family from an unknown token, we rely on the client
    // presenting it after a previous successful refresh. In production, store
    // rotated tokens marked "used" instead of deleting, so you can detect reuse.
    return res.status(401).json({ error: 'invalid refresh token' });
  }
  if (revokedFamilies.has(entry.familyId) || entry.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'invalid refresh token' });
  }

  refreshStore.delete(key);
  const tokens = issueTokens(entry.userId, 'user', entry.familyId);
  res.json(tokens);
});
```

Store rotated tokens marked as used (not deleted) if you want to actively detect reuse and burn the whole family.

## Ex 4 — RS256

```ts
import { readFileSync } from 'node:fs';
const privateKey = readFileSync('private.pem');
const publicKey  = readFileSync('public.pem');

const token = jwt.sign({ sub: '42' }, privateKey, { algorithm: 'RS256', expiresIn: '15m' });
const claims = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
```

**Why it scales:** you can hand the **public** key to any downstream service and let it verify tokens without needing the signing secret. If a downstream service is compromised, the attacker cannot mint new tokens.

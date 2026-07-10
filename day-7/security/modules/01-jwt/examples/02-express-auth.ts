/**
 * Example 2 — minimal Express server with JWT-protected route.
 *
 * Run: npx tsx 02-express-auth.ts
 *
 * Try:
 *   curl http://localhost:3001/public
 *   curl -X POST http://localhost:3001/login -H "content-type: application/json" -d "{\"email\":\"ada@x.com\",\"password\":\"pw\"}"
 *   curl http://localhost:3001/me -H "Authorization: Bearer <token>"
 */
import express, { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET = 'super-secret-training-key-change-me';
const app = express();
app.use(express.json());

interface AuthedRequest extends Request {
  user?: { sub: string; role: string };
}

function authGuard(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const claims = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],
      issuer: 'notes-api',
      audience: 'notes-web',
    }) as JwtPayload;
    req.user = { sub: String(claims.sub), role: String(claims.role) };
    next();
  } catch {
    // Do not leak *why* verification failed — generic 401.
    res.status(401).json({ error: 'unauthorized' });
  }
}

app.get('/public', (_req, res) => res.json({ ok: true, route: 'public' }));

app.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};
  // In real code: look up user, compare password with argon2/bcrypt.
  if (email !== 'ada@x.com' || password !== 'pw') {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = jwt.sign({ sub: '42', role: 'user' }, SECRET, {
    algorithm: 'HS256',
    issuer: 'notes-api',
    audience: 'notes-web',
    expiresIn: '15m',
  });
  res.json({ accessToken: token });
});

app.get('/me', authGuard, (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});

app.listen(3001, () => console.log('http://localhost:3001'));

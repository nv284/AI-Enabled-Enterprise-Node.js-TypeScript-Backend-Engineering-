/**
 * DELIBERATELY VULNERABLE — do not deploy.
 *
 * This file contains many bugs on purpose so trainees can practice using
 * npm audit, Semgrep, and AI assistants to find and fix them.
 *
 * A partial list of planted issues (do not read on first pass — try to find them yourself):
 *   1. Hardcoded JWT secret in source
 *   2. jwt.verify without `algorithms` whitelist (alg confusion)
 *   3. Weak password hashing (SHA-256, no salt)
 *   4. SQL injection via string concatenation ($queryRawUnsafe simulated)
 *   5. BOLA: /notes/:id returns any note without ownership check
 *   6. Mass assignment: PATCH /me copies all keys from req.body onto the user
 *   7. Open redirect: /redirect?url=...
 *   8. Verbose error handler (stack traces to client)
 *   9. Password in log lines
 *  10. No rate limits, no body size limit
 *  11. Old vulnerable versions of express@4.18.2 / jsonwebtoken@8.5.1
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';

// 1. Hardcoded secret
const SECRET = 'super-secret-do-not-share';

const app = express();
app.use(express.json()); // 10. no size limit

// Fake "DB"
type User = { id: string; email: string; passwordHash: string; role: 'user' | 'admin' };
const users: User[] = [
  { id: 'ada', email: 'ada@x.com', passwordHash: sha256('pw'), role: 'user' },
  { id: 'bob', email: 'bob@x.com', passwordHash: sha256('pw'), role: 'user' },
];
type Note = { id: string; userId: string; title: string; body: string };
const notes: Note[] = [
  { id: '1', userId: 'ada', title: 'Ada shopping', body: 'milk, bread' },
  { id: '2', userId: 'bob', title: "Bob's secrets", body: 'redacted' },
];

// 3. Weak password hashing
function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex');
}

// 9. logs the password
app.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};
  console.log('login attempt', { email, password });
  const user = users.find(u => u.email === email);
  if (!user || user.passwordHash !== sha256(password)) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  // 2. no algorithms whitelist on verify (see below); here we at least sign properly
  const token = jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// 6. Mass assignment
app.patch('/me', (req, res) => {
  const auth = (req.header('authorization') ?? '').split(' ')[1];
  const claims = jwt.verify(auth, SECRET) as any; // 2. no algorithms whitelist
  const user = users.find(u => u.id === claims.sub);
  if (!user) return res.status(404).json({ error: 'not found' });
  Object.assign(user, req.body);
  res.json(user);
});

// 5. BOLA
app.get('/notes/:id', (req, res) => {
  const auth = (req.header('authorization') ?? '').split(' ')[1];
  try {
    jwt.verify(auth, SECRET); // 2. still no algorithms whitelist
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const note = notes.find(n => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'not found' });
  res.json(note); // returns any note to any authenticated user
});

// 4. SQL injection style — we simulate with a "raw" filter that trusts input
app.get('/search', (req, res) => {
  const q = String(req.query.q ?? '');
  // Imagine this is: db.$queryRawUnsafe(`SELECT * FROM notes WHERE title LIKE '%${q}%'`)
  const rawFilter = new Function('n', `return n.title.includes("${q}")`); // NEVER DO THIS
  try {
    const found = notes.filter((n) => rawFilter(n));
    res.json(found);
  } catch (e) {
    res.status(500).json({ error: 'search failed' });
  }
});

// 7. Open redirect
app.get('/redirect', (req, res) => {
  const url = String(req.query.url ?? '/');
  res.redirect(url);
});

// 8. Verbose error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(500).send(err.stack);
});

app.listen(4000, () => console.log('vulnerable-app on http://localhost:4000 (DO NOT DEPLOY)'));

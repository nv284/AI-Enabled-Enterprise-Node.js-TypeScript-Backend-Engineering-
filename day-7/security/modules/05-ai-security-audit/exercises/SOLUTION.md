# Reference — Fixes for the vulnerable-app

For each planted bug, here is the intended fix. Use this as an answer key for the exercises. Trainees should reach a similar diff by combining tool output and their own review.

---

## 1. Hardcoded secret

```diff
- const SECRET = 'super-secret-do-not-share';
+ const SECRET = process.env.JWT_SECRET;
+ if (!SECRET || SECRET.length < 32) throw new Error('JWT_SECRET missing or too short');
```

## 2. `jwt.verify` without `algorithms`

```diff
- jwt.verify(auth, SECRET);
+ jwt.verify(auth, SECRET, {
+   algorithms: ['HS256'],
+   issuer: 'notes-api',
+   audience: 'notes-web',
+ });
```

## 3. Weak password hashing

Replace `sha256(password)` with argon2id (see Module 4 Ex 3).

## 4. Simulated SQL injection / `new Function(...)`

```diff
- const rawFilter = new Function('n', `return n.title.includes("${q}")`);
- const found = notes.filter((n) => rawFilter(n));
+ const found = notes.filter((n) => n.title.includes(q));
```

For real SQL: use Prisma parameterised queries or `$queryRaw` tagged template.

## 5. BOLA on `/notes/:id`

```diff
  const note = notes.find(n => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'not found' });
+ const claims = /* verified above */;
+ if (note.userId !== claims.sub && claims.role !== 'admin') {
+   return res.status(404).json({ error: 'not found' });
+ }
  res.json(note);
```

## 6. Mass assignment on `PATCH /me`

Introduce a Zod `.strict()` schema:

```ts
const UpdateMe = z.object({
  email: z.string().email().optional(),
}).strict();
```

Then merge only `parsed.data`.

## 7. Open redirect

```diff
- res.redirect(String(req.query.url ?? '/'));
+ const ALLOWED = new Set(['/', '/dashboard', '/notes']);
+ const url = String(req.query.url ?? '/');
+ res.redirect(ALLOWED.has(url) ? url : '/');
```

## 8. Verbose error handler

Use the pattern from Module 4 Ex 4 — generic body + correlation id.

## 9. Passwords in log lines

Remove them. Better: use `pino` with a redact list from Module 4 Ex 5.

## 10. No rate limit / no body size

```ts
app.use(express.json({ limit: '100kb' }));
app.use('/login', rateLimit({ windowMs: 15 * 60_000, max: 10 }));
```

## 11. Outdated dependencies

```
npm i express@^4.19 jsonwebtoken@^9
```

Note: `jsonwebtoken` v9 disallows `alg: none` by default. Free win.

# Module 4 — Exercises

Each exercise is small and self-contained. They culminate in a set of reusable middleware you'll drop into the end-to-end project.

## Ex 1 — Zod validation middleware (15 min)

Create `middleware/validate.ts` exporting:

```ts
export const validate =
  (schema: z.ZodTypeAny, target: 'body' | 'query' | 'params' = 'body') =>
  (req, res, next) => { /* ... */ };
```

- Parse `req[target]` with the schema.
- On failure: `400 { error: 'invalid_body' }` (do not echo raw Zod issues in production; that can leak internal field names).
- On success: replace `req[target]` with `parsed.data`.

Write two tests: valid input passes, extra key `role` is rejected because you used `.strict()`.

## Ex 2 — Rate limit login (10 min)

Add `express-rate-limit` to `/auth/login`:

- 10 requests per 15 min per IP.
- On block: return `429 { error: 'too_many_requests' }`.
- Reason about: is per-IP enough? What about credential stuffing from a botnet? (Answer: pair per-IP with per-account counters.)

## Ex 3 — Password migration to argon2 (20 min)

The starter `starter/passwords.ts` uses `crypto.createHash('sha256')`. Replace it with `argon2id`.

- `hashPassword(plain): Promise<string>`
- `verifyPassword(plain, stored): Promise<boolean>`
- Ensure login returns the **same** generic error and takes similar time whether the user exists or not (hint: hash a dummy password on the "user not found" path).

## Ex 4 — Safe error handler (15 min)

The starter `starter/errors.ts` sends `err.stack` to the client. Rewrite it:

- 4xx: forward only the `code` field from known `AppError`s.
- 5xx: always `internal_error`.
- Attach a `correlationId` header (`x-correlation-id`) to every response, generated in a middleware at the top of the stack.
- Log the full error via `console.error` (or `pino`) with the correlation id.

## Ex 5 — Redacted logging (15 min)

Introduce `pino` with a redaction list. Verify:

- `logger.info({ password: 'hunter2' }, 'login')` outputs `password: '[REDACTED]'`.
- Log an incoming request but do **not** log `authorization` header or `cookie`.

## Ex 6 (stretch) — CORS + helmet (10 min)

- Configure `helmet()` with a strict Content Security Policy for an HTML endpoint that renders a simple page.
- Configure `cors()` to allow exactly one origin (`http://localhost:5173`) with credentials.

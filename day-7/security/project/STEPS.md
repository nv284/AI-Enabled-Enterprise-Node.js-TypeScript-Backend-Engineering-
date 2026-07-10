# Build Steps

The `project/` folder already contains the **final** working code. If you want to build it yourself alongside the training, follow this sequence. Otherwise, read the corresponding files and run the API.

---

## Step 1 — Scaffold (after Module 1) — 30 min

Goals: `POST /auth/register`, `POST /auth/login`, protected `GET /me`.

1. `npm init -y && npm i express jsonwebtoken argon2 zod dotenv @prisma/client && npm i -D @types/express @types/jsonwebtoken @types/node prisma tsx typescript`
2. `npx tsc --init` — adjust `strict: true`, `moduleResolution: Bundler`, `module: ES2022`.
3. `npx prisma init --datasource-provider sqlite`
4. Define `User` model in `prisma/schema.prisma` — `id`, `email` (unique), `passwordHash`, `role`, `createdAt`.
5. `npx prisma migrate dev --name init`
6. Write `src/services/password.ts` (`hashPassword`, `verifyPassword`), `src/services/tokens.ts` (`issueAccess`), `src/middleware/authGuard.ts`.
7. Write `src/routes/auth.ts` — register + login.
8. Boot from `src/index.ts` on port 3000.

**Acceptance:** register → login → `GET /me` returns your user.

## Step 2 — Refresh tokens (still Module 1) — 30 min

1. Add `RefreshToken` model: `id`, `userId`, `tokenHash`, `familyId`, `expiresAt`, `revokedAt`.
2. In `services/tokens.ts` add `issueRefresh(userId, familyId?)` returning the raw token; store its `sha256` hash + a `familyId` in DB.
3. Add `/auth/refresh` — verify the refresh token, rotate: revoke old, issue new pair. On **reuse of a revoked token in the family**, revoke the whole family.
4. Add `/auth/logout` — revoke by hash.

**Acceptance:** you can rotate refresh tokens; using an old one after rotation returns 401 and burns the family.

## Step 3 — RBAC + Notes (after Module 2) — 45 min

1. Add `Note` model: `id` (uuid), `userId`, `title`, `body`, timestamps.
2. Add `requireRole('admin')` middleware.
3. Routes:
   - `POST /notes` — auth required, create for `req.user.sub`.
   - `GET /notes` — auth required, return only user's notes. Admin sees all with `?all=true`.
   - `GET /notes/:id` — 404 if not owner and not admin.
   - `PATCH /notes/:id`, `DELETE /notes/:id` — owner or admin.
   - `GET /admin/users` — admin only.
4. `PATCH /users/me` uses a strict Zod schema (no `role` allowed).

**Acceptance:** Bob cannot read Ada's note (returns 404); admin can.

## Step 4 — Google Sign-In (after Module 3) — 45 min

1. `npm i openid-client cookie-session`.
2. `src/services/google.ts` — lazy `Issuer.discover` + client construction.
3. `src/routes/googleAuth.ts` — `/auth/google/start` and `/auth/google/callback`.
4. In callback: `findOrCreateUser` on Google `sub`, mint your own JWT + refresh, then redirect or return JSON.

**Acceptance:** clicking Sign in with Google logs you in and issues an app JWT.

## Step 5 — Harden (after Module 4) — 45 min

1. `npm i helmet cors express-rate-limit pino`.
2. Wire `helmet()`, `cors()` (allow-list), `express.json({ limit: '100kb' })`.
3. Rate limits: `authLimiter` on `/auth/*`, `apiLimiter` on `/notes/*` and `/admin/*`.
4. `correlationId` middleware; `errorHandler` at the end. `AppError` class for known 4xx errors.
5. `logger` with redaction; log request start/end with correlation id.

**Acceptance:** 11th login attempt in 15 min from same IP returns 429. Stack traces never appear in HTTP responses.

## Step 6 — Audit (after Module 5) — 60 min

1. `npm audit` → triage with Copilot Chat.
2. Semgrep with community + custom rules → triage with Copilot Chat.
3. Copilot Chat full-file review on every route file.
4. Fix ≥ 3 real findings. Commit each fix separately.
5. Write `AUDIT.md`: date, findings, decisions, deferred items.

**Acceptance:** clean tools, `AUDIT.md` present, presenter demoes one fix.

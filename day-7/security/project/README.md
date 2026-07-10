# Secure Notes API — End-to-End Project

A minimal but production-shaped Express + TypeScript API that ties every module together.

## Features

- Register / login with email + password (**argon2id**)
- **JWT** access tokens + rotating **refresh tokens** stored server-side (hashed)
- **Google Sign-In** via OpenID Connect (Auth Code + PKCE)
- **RBAC**: `user` and `admin` roles + per-record ownership
- **Zod** validation everywhere at the boundary
- **helmet**, **CORS**, **rate limit**, body size limit, **pino** with redaction
- Safe error handler with correlation ids
- **Prisma + SQLite** (zero-setup DB)
- Ready for AI-assisted audit on Day 2

## Prereqs

Complete `../SETUP.md`.

## Quick start

```powershell
cd project
npm install
cp .env.example .env
# edit .env: JWT_SECRET, GOOGLE_CLIENT_ID/SECRET (optional for step 1)
npx prisma migrate dev --name init
npm run dev
```

API now on http://localhost:3000. Try:

```powershell
# register
curl -X POST http://localhost:3000/auth/register `
  -H "content-type: application/json" `
  -d '{"email":"ada@x.com","password":"correct horse battery staple","name":"Ada"}'

# login
curl -X POST http://localhost:3000/auth/login `
  -H "content-type: application/json" `
  -d '{"email":"ada@x.com","password":"correct horse battery staple"}'

# create note (paste the accessToken from login)
curl -X POST http://localhost:3000/notes `
  -H "authorization: Bearer <TOKEN>" `
  -H "content-type: application/json" `
  -d '{"title":"first","body":"hello"}'
```

## Structure

```
project/
├─ prisma/
│  └─ schema.prisma          Prisma schema (User, Note, RefreshToken)
├─ src/
│  ├─ index.ts               Server bootstrap
│  ├─ app.ts                 Express app + middleware wiring
│  ├─ config/env.ts          Env parsing (fails fast if missing)
│  ├─ db.ts                  Prisma client singleton
│  ├─ logger.ts              pino logger with redaction
│  ├─ errors.ts              AppError + safe error handler + correlationId
│  ├─ middleware/
│  │  ├─ authGuard.ts        JWT verification
│  │  ├─ requireRole.ts      Role check
│  │  ├─ validate.ts         Zod validation
│  │  └─ rateLimit.ts        Rate limiters
│  ├─ services/
│  │  ├─ password.ts         argon2id hash/verify + timing-safe login
│  │  ├─ tokens.ts           JWT issue + refresh rotation
│  │  └─ google.ts           OIDC helpers (lazy-init)
│  ├─ routes/
│  │  ├─ auth.ts             /auth/register /auth/login /auth/refresh /auth/logout
│  │  ├─ googleAuth.ts       /auth/google/start /auth/google/callback
│  │  ├─ notes.ts            /notes  (ownership enforced)
│  │  └─ admin.ts            /admin/*  (admin only)
│  └─ types/express.d.ts     Adds req.user, req.correlationId typings
├─ tests/
│  └─ api.http               REST Client requests you can run in VS Code
├─ .env.example
├─ package.json
└─ tsconfig.json
```

## Build order (Day 1 + Day 2)

We build the API progressively — each step matches a training module. Follow `STEPS.md` for the exact instructions per step; the code in this folder is the **final** state, which you can diff against your own.

- **Step 1** — Bootstrap Express + Prisma, register/login with argon2, JWT access token. *(after Module 1)*
- **Step 2** — Refresh tokens with rotation, revocation on logout. *(after Module 1)*
- **Step 3** — Notes CRUD with ownership checks + `admin` bypass. *(after Module 2)*
- **Step 4** — Google Sign-In. *(after Module 3)*
- **Step 5** — Harden: helmet, CORS, rate limits, body size, correlation id, structured logs, error handler. *(after Module 4)*
- **Step 6** — Audit with `npm audit` + Semgrep + Copilot Chat. Fix ≥ 3 findings. Write `AUDIT.md`. *(after Module 5)*

## Testing

- REST Client requests in `tests/api.http` — click "Send Request" above each line in VS Code.
- Or use `curl` from the terminal.

## Deployment (not covered in-depth)

For production:
- Move `JWT_SECRET` to a secret manager.
- Switch Prisma provider to Postgres (`DATABASE_URL`).
- Terminate TLS at a reverse proxy (nginx, Caddy, Azure App Gateway) and set `app.set('trust proxy', 1)`.
- Set `secure: true` on cookies.
- Add a health endpoint + graceful shutdown.

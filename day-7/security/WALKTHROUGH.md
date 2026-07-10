# Step-by-Step Walkthrough

A concrete, minute-by-minute companion to [AGENDA.md](AGENDA.md). For each step you get:

- **Goal** — what "done" looks like.
- **Do** — the commands / edits to make.
- **Ask the room** — discussion prompts the facilitator uses.
- **AI prompts** — Copilot Chat prompts (only where AI actually helps).
- **Check** — how to verify you're done.

Every AI prompt assumes GitHub Copilot Chat in VS Code. Paste the prompt in the chat panel, then attach or paste the relevant file/output.

> Never paste real secrets, `.env` values, or customer data into any AI chat.

---

## Day 1 — Identity & Access

### Step 0 — Room setup (before 09:00, 10 min)

**Do**
1. Everyone confirms [SETUP.md](SETUP.md) is complete:
   ```powershell
   node -v; npm -v; git --version; npx tsx --version
   ```
2. Open the workspace in VS Code:
   ```powershell
   code "C:\Data\OneDrive - bookstruck1\GenAI\security"
   ```
3. Pair up (2 per laptop is fine).

**Check** — everyone can `npx tsx --version` and open the folder.

---

### Step 1 — Module 0 : Intro to Security (30 min, 09:00–09:30)

**Goal** — shared vocabulary (CIA, AuthN vs AuthZ, STRIDE, OWASP API Top 10).

**Do**
- Read [modules/00-intro-security/README.md](modules/00-intro-security/README.md) together.
- Run the "Threat-storm your favourite app" activity in pairs (10 min).

**Ask the room**
1. "In one sentence, what is the difference between authentication and authorization?"
2. "Where in the CIA triad does a **password leak** primarily hit?"
3. "Give me a real-world example of a **BOLA** bug you've read about."
4. "Which is worse for your business: a 1-hour outage or one leaked customer record — and why?"

**AI prompts** _(optional — for participants who want to explore further)_
```
Explain the OWASP API Top 10 (2023) with one real-world breach example per
category. Be brief. Do not invent breach names; if unsure, say so.
```

**Check** — each pair produced one attack + one control on the shared board.

---

### Step 2 — Module 1 : JWT (2 h, 09:30–11:30)

**Goal** — sign, verify, and understand refresh token rotation. Recognise the top JWT footguns.

**Do**
1. Read [modules/01-jwt/README.md](modules/01-jwt/README.md).
2. Install and run the examples:
   ```powershell
   cd modules/01-jwt/examples
   npm install
   npx tsx 01-sign-verify.ts
   npx tsx 04-attack-alg-none.ts
   ```
3. Complete Exercises 1–3 in [modules/01-jwt/exercises/README.md](modules/01-jwt/exercises/README.md).

**Ask the room**
1. "What are the three parts of a JWT?"
2. "The payload is base64, not encrypted — so what stops a client from just editing it?"
3. "Why do we bother with **refresh tokens** at all?"
4. "Name three things you must **never** put in the payload."
5. "If our JWT secret leaks, what's our incident-response plan?"

**AI prompts**

Prompt 2.1 — explain a specific claim to a fresher:
```
Explain to a fresher developer, in 5 lines, what the `aud` claim in a JWT is
and why an API should pin it to a specific value when calling jwt.verify.
Include a one-line code example using the `jsonwebtoken` npm package.
```

Prompt 2.2 — grade my authGuard (Exercise 2):
```
You are a senior security engineer. Review this Express middleware for JWT
verification. For each issue you find, give: file:line, severity, why it's
bad, and the smallest safe fix. If it looks correct, say "no confident
findings". Only comment on issues you can point at a specific line for.

--- paste your authGuard.ts here ---
```

Prompt 2.3 — design refresh rotation:
```
I have an Express + TS API with a Prisma model:
model RefreshToken { id String @id; userId String; tokenHash String @unique;
familyId String; expiresAt DateTime; revokedAt DateTime? }

Write TypeScript for `rotateRefreshToken(rawToken: string)` that:
- looks up the record by sha256(rawToken),
- if the record is already revoked, revokes the entire family (reuse detection),
- otherwise marks it revoked and creates a new refresh token in the same family,
- returns { accessToken, refreshToken } or throws AppError('invalid_token', 401).

Only use APIs that exist in @prisma/client v5. Do not invent methods.
```

**Check** — you can log in on `02-express-auth.ts` and hit `/me`; the `alg:none` demo prints "rejected" on the safe path.

---

### Break (15 min, 11:30–11:45)

---

### Step 3 — Module 2 : RBAC (1 h 15, 11:45–13:00)

**Goal** — write `requireRole` + `requirePermission`, fix BOLA and mass assignment.

**Do**
1. Read [modules/02-rbac/README.md](modules/02-rbac/README.md).
2. Run the RBAC demo:
   ```powershell
   cd modules/02-rbac/examples
   npm install
   npx tsx 01-rbac-middleware.ts
   ```
3. Complete Exercises 1–3.
4. Do the **"Steal Bob's notes"** activity in pairs.

**Ask the room**
1. "Where does the `role` value come from when we decide access — the JWT, the body, or the DB? Why?"
2. "Why do we return **404** instead of 403 for a note that exists but doesn't belong to you?"
3. "A route works because you added `requireRole('admin')`. A junior removes it in a refactor. How does the team catch that in code review?"
4. "Give me one real business flow where **role-only** RBAC is not enough."

**AI prompts**

Prompt 3.1 — find missing authorization checks:
```
Review this Express router for authorization bugs (BOLA and BFLA). For each
route, tell me:
- Does it verify the caller is authenticated?
- Does it verify the caller is authorized for the specific resource (ownership) or function (role)?
- If not, propose the minimal patch.

Only comment on issues you can point at a line for. Do not invent problems.

--- paste your routes/notes.ts here ---
```

Prompt 3.2 — mass-assignment audit:
```
Find any place in this file where user-supplied JSON is merged into a
persisted object without a strict whitelist (e.g. Object.assign, spread of
req.body, Prisma update with req.body as data). For each, show the exploit
and the Zod schema that fixes it.

--- paste your file(s) ---
```

**Check** — Ada's token cannot fetch Bob's note (returns 404). A `PATCH /me` with `{"role":"admin"}` returns 400 and does not change the role.

---

### Lunch (14:00)

---

### Step 4 — Module 3 : OAuth2 / OIDC with Google (2 h, 14:00–16:00)

**Goal** — real Google Sign-In using Auth Code + PKCE.

**Do**
1. Confirm you have your **Google Client ID + Secret** from SETUP.md § 5.
2. Read [modules/03-oauth2-oidc/README.md](modules/03-oauth2-oidc/README.md).
3. Run the demo:
   ```powershell
   cd modules/03-oauth2-oidc/examples
   npm install
   Copy-Item .env.example .env
   # paste your Google credentials into .env
   npx tsx 01-google-oidc.ts
   ```
4. Open http://localhost:3000 and complete the flow.
5. Complete Exercises 1–3 in [modules/03-oauth2-oidc/exercises/README.md](modules/03-oauth2-oidc/exercises/README.md).

**Ask the room**
1. "Name the four OAuth2 actors."
2. "What does the `state` parameter defend against? Draw the attack on the whiteboard."
3. "PKCE prevents which specific attack?"
4. "OAuth2 gives me an access token. OIDC also gives me an **ID token**. Which one proves *identity*?"
5. "Why is the **Implicit flow** deprecated?"

**AI prompts**

Prompt 4.1 — explain the flow to a fresher:
```
Explain the OAuth 2.0 Authorization Code + PKCE flow to a fresher, in 10
lines or fewer. Use these role names: user, browser, our app, Google. Do
not add anything about implicit or ROPC flows.
```

Prompt 4.2 — verify ID token manually:
```
Write a TypeScript function `verifyGoogleIdToken(idToken: string, expectedAudience: string)`
that:
- fetches Google's JWKS from https://www.googleapis.com/oauth2/v3/certs (cached),
- verifies signature, issuer=https://accounts.google.com, audience, exp,
- returns the claims,
- throws on any failure.

Use the `jose` npm package (v5). Only use APIs that exist in that version.
```

Prompt 4.3 — spot the missing check:
```
Review this /auth/callback handler. I'm especially worried about:
- state / CSRF,
- PKCE code_verifier,
- nonce,
- open redirect after login,
- token storage.

Cite file:line for each issue. If it's fine, say so.

--- paste your googleAuth.ts ---
```

**Check** — you signed in with Google and the callback returned your name + email.

---

### Break (15 min, 16:00–16:15)

---

### Step 5 — Project kickoff : scaffold Secure Notes API (1 h, 16:15–17:15)

**Goal** — first end-to-end run of the project with register/login working.

**Do**
1. Change directory and install:
   ```powershell
   cd ..\..\..\project
   npm install
   Copy-Item .env.example .env
   ```
2. Generate a proper `JWT_SECRET` and `SESSION_SECRET`:
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```
   Paste each output into `.env` for `JWT_SECRET` and `SESSION_SECRET`.
3. Initialise the DB:
   ```powershell
   npx prisma migrate dev --name init
   ```
4. Boot the API:
   ```powershell
   npm run dev
   ```
5. Open [project/tests/api.http](project/tests/api.http) in VS Code and step through the requests (REST Client extension).
6. Promote yourself to admin (optional):
   ```powershell
   npx prisma studio
   # edit your user row: role = "admin"
   ```

**Ask the room**
1. "Show me on the schema **where** an attacker could still cause damage even after auth is in place."
2. "Which of the OWASP API Top 10 have we **not** addressed yet?" (answer: rate limits, headers, mass assignment defence, etc. — that's Day 2.)

**AI prompts**

Prompt 5.1 — Copilot walk-through of the codebase:
```
I'm a fresher joining this repo. In 10 bullet points, describe what each
file in project/src/ is responsible for, in the order I should read them
to understand the auth flow.
```

Prompt 5.2 — sanity-check my env parsing:
```
Review project/src/config/env.ts. Look for:
- secrets with weak defaults,
- values that should fail fast if missing but currently don't,
- keys logged unintentionally.

Only cite issues you can point at a line for.

--- paste env.ts ---
```

**Check** — you can register, log in, `GET /me`, and create + list your own notes. Bob's notes are not visible to Ada.

---

### Day 1 retro (10 min, 17:15)

Round-the-room:
- One thing you learned.
- One thing that is still fuzzy.
- One question for tomorrow.

---

## Day 2 — Hardening & AI-Assisted Audit

### Step 6 — Module 4 : Secure API Design (2 h, 09:00–11:00)

**Goal** — internalize the design defaults: validate, limit, header, hash, log, error.

**Do**
1. Read [modules/04-secure-api-design/README.md](modules/04-secure-api-design/README.md).
2. Complete Exercises 1–5 in [modules/04-secure-api-design/exercises/README.md](modules/04-secure-api-design/exercises/README.md).
3. Do the "Threat-model the Notes API" whiteboard activity together.

**Ask the room**
1. "Why `argon2id` and not `bcrypt`? When is bcrypt fine?"
2. "What does the `.strict()` on a Zod object schema buy you?"
3. "A 500 response body says `Error: password mismatch for ada@x.com`. Two things wrong with that. What are they?"
4. "What's a **correlation id**, and where does it live in a request?"
5. "Which OWASP API Top 10 issues are *not* fixable by middleware alone?"

**AI prompts**

Prompt 6.1 — turn my thinking into middleware:
```
Write a small Express + TS middleware `requestLogger` that:
- generates a correlation id (uuid v4) if `x-correlation-id` header is absent,
- sets it on req.correlationId and on the response header,
- uses pino to log the incoming request with { method, url, correlationId } but redacts `authorization` and `cookie` headers,
- logs the response status on `res.on('finish')` with duration in ms.

Use pino v9. Do not add any other logic.
```

Prompt 6.2 — argon2 timing-safe login:
```
Given this login handler, rewrite it so that the response takes similar time
whether the user exists or not, to prevent user enumeration. Use argon2id
via the `argon2` npm package v0.40+.

--- paste your handler ---
```

Prompt 6.3 — CSP that actually loads a simple form:
```
Give me a helmet Content-Security-Policy configuration for an Express server
that serves:
- a single HTML form at GET /,
- a POST /login endpoint,
- no external scripts, no external images,
- only same-origin styles + one inline <style> block.

Output the exact helmet() options object. Do not include anything else.
```

**Check** — you can list 5 middleware you now use on every route without thinking.

---

### Break (15 min, 11:00–11:15)

---

### Step 7 — Project : harden the Notes API (1 h 45, 11:15–13:00)

**Goal** — apply everything from Module 4 to `project/` and (if not already done) wire Google Sign-In.

**Do**
1. Review [project/STEPS.md](project/STEPS.md) Steps 4 & 5. The final project code already has these; if you were building from scratch, this is where you'd catch up.
2. Run the API and test each new safeguard with a hostile request:

   Body too large:
   ```powershell
   $body = "x" * 200000
   curl -X POST http://localhost:3000/auth/register -H "content-type: application/json" -d "{\"email\":\"a@a.com\",\"password\":\"$body\"}"
   ```
   Expect: 413 or 400.

   Rate limit:
   ```powershell
   1..25 | ForEach-Object { curl -s -o NUL -w "%{http_code}`n" -X POST http://localhost:3000/auth/login -H "content-type: application/json" -d '{"email":"x@x.com","password":"nope"}' }
   ```
   Expect: some 401s then 429s.

   Mass assignment:
   ```powershell
   curl -X POST http://localhost:3000/auth/register -H "content-type: application/json" -d '{"email":"m@m.com","password":"correct horse battery staple","name":"M","role":"admin"}'
   ```
   Then log in and `GET /me` — role should be `"user"`, not `"admin"`.

**Ask the room**
1. "Point to the line that stops mass assignment. Would deleting it break any test? Why?"
2. "If we swap SQLite for Postgres in production, which lines change and which don't?"
3. "Where would we plug in a **per-account** login-failure counter (in addition to per-IP)?"

**AI prompts**

Prompt 7.1 — full-file review of routes:
```
You are a senior application security engineer. Review this Express router
for security issues. For each finding, output a row:

| # | file:line | severity | CWE | Issue (1 line) | Exploit sketch (2 lines) | Fix (3 lines of code) |

Rules: only issues you can point at a specific line for. If unsure, say
"no confident findings". Do not invent CWE IDs.

--- paste project/src/routes/notes.ts ---
```

Prompt 7.2 — same for auth:
```
Same rubric as above. Focus especially on: user enumeration via timing or
error messages, missing rate limits, refresh-token reuse detection,
password strength requirements, and information leakage in error bodies.

--- paste project/src/routes/auth.ts ---
```

Prompt 7.3 — threat-model a new endpoint before writing it:
```
I'm about to add:
  POST /notes/:id/share
  Body: { emails: string[], expiresInDays?: number }
  Auth: JWT, owner or admin only.

Threat-model with STRIDE. For each threat that applies to our stack (Express
+ TS + Zod + Prisma), give the concrete control with code. Skip threats
that don't apply.
```

**Check** — hostile-request tests above return proper 4xx codes; no stack traces in any response body.

---

### Lunch (14:00)

---

### Step 8 — Module 5 : AI-assisted security audit (2 h, 14:00–16:00)

**Goal** — comfort using `npm audit`, Semgrep, and Copilot Chat together.

**Do**
1. Read [modules/05-ai-security-audit/README.md](modules/05-ai-security-audit/README.md).
2. Bootstrap the vulnerable app:
   ```powershell
   cd modules/05-ai-security-audit/vulnerable-app
   npm install
   npm audit --json > audit.json
   semgrep --config .semgrep --config p/typescript --config p/owasp-top-ten --config p/nodejsscan -j src > semgrep.json
   ```
   _(If Semgrep isn't installed locally, use the Docker command from Module 5 README.)_
3. Complete Exercises 1–4 in [modules/05-ai-security-audit/exercises/README.md](modules/05-ai-security-audit/exercises/README.md).
4. Run the "AI vs Human" bug hunt activity (30 min).

**Ask the room**
1. "Which of these three tools catches which class of bug?"
2. "Copilot Chat says CVE-2024-XXXXX is critical. What's your next click?"
3. "Give me one bug that only a **human** review would catch."
4. "How do you make an AI prompt that resists hallucination? Name three tactics."

**AI prompts** — full library at [modules/05-ai-security-audit/prompts/copilot-chat-prompts.md](modules/05-ai-security-audit/prompts/copilot-chat-prompts.md). The two you'll use most:

Prompt 8.1 — triage `npm audit`:
```
Given this `npm audit --json` output for a Node.js API deployed server-side,
group findings into:
- "must fix now" (RCE, prototype pollution, auth bypass, injection in a runtime dep)
- "fix this sprint" (medium severity in runtime deps)
- "acceptable risk" (dev-only deps, or advisory doesn't apply server-side)

For each, explain WHY. Quote only advisory IDs that appear in the JSON.
Output a markdown table sorted by severity desc.

--- paste audit.json ---
```

Prompt 8.2 — triage Semgrep:
```
I ran semgrep with p/typescript, p/owasp-top-ten, p/nodejsscan + custom
rules. For each finding below:
1. Classify: TRUE_POSITIVE / LIKELY_FALSE_POSITIVE / NEEDS_CONTEXT.
2. If TRUE_POSITIVE, propose the smallest safe patch as a unified diff.
3. Group by severity, then CWE.

Cite only rule IDs and file:line that appear below.

--- paste semgrep.json ---
```

Prompt 8.3 — full-file review (rerun per file):
```
You are a senior application security engineer. Review the following file
for security issues. For each finding, output a row:

| # | file:line | severity | CWE | Issue | Exploit sketch | Fix code |

Only cite lines that exist. If unsure, say "no confident findings" for that
category. Focus: broken authN, broken authZ (BOLA/BFLA), input validation,
injection, weak crypto & password storage, missing rate limits, logging of
secrets, mass assignment, error/stack leakage, open redirect, SSRF, CSRF.

--- paste one file ---
```

Prompt 8.4 — write a new Semgrep rule:
```
Write a Semgrep rule (YAML) that flags any call to res.status(500).send(err.stack)
or res.status($X).json({ error: err.stack }) in TypeScript / JavaScript.
Include:
- id
- languages
- severity: ERROR
- message explaining the risk in 2 lines
- patterns block using pattern / pattern-either
```

**Check** — the triage tables in `modules/05-ai-security-audit/exercises/findings/*.md` are filled in.

---

### Break (15 min, 16:00–16:15)

---

### Step 9 — Capstone : audit your own Secure Notes API (1 h, 16:15–17:15)

**Goal** — apply the whole workflow to `project/`. Fix ≥ 3 findings. Write [project/AUDIT.md](project/AUDIT.md).

**Do**
1. From `project/`:
   ```powershell
   cd C:\Data\OneDrive - bookstruck1\GenAI\security\project
   npm audit --json > audit.json
   semgrep --config .semgrep --config p/typescript --config p/owasp-top-ten --config p/nodejsscan -j src > semgrep.json
   ```
2. Feed both to Copilot Chat using **Prompt 8.1** and **Prompt 8.2**.
3. Run **Prompt 8.3** once per file in `src/routes/` and `src/middleware/`.
4. From the union of findings, pick **≥ 3 real** issues. Ignore false positives (justify each briefly in AUDIT.md).
5. Fix each in a separate commit. Re-run the tools; the finding must be gone.
6. Fill in [project/AUDIT.md](project/AUDIT.md).

**Ask the room**
1. "Which finding surprised you most?"
2. "Any finding that was a **false positive**? What made it look real?"
3. "Which single change do you think buys us the most security per line of code?"

**AI prompts**

Prompt 9.1 — write the audit report:
```
Draft an AUDIT.md for a Node.js API using the template at
project/AUDIT.md. I'll paste:
1. My findings table (from the tools I already triaged).
2. My fix commits (git log oneline).

Produce a professional short report: exec summary (5 lines), findings table
in the template, deferred items with justification, notes on AI usage. Do
not invent findings or commits I didn't provide.

--- paste findings + git log ---
```

Prompt 9.2 — verify my fix didn't regress anything:
```
Given the diff below and the previous version of the file, tell me:
- Does the fix actually close the reported issue?
- Does it introduce any new security concern (e.g. new endpoint, new
  outbound call, weaker validation)?
- Are there tests you'd add?

--- paste git diff ---
```

**Check** — [project/AUDIT.md](project/AUDIT.md) is filled in with at least 3 findings, 3 fix commits, and a "notes on AI usage" section. Each participant demoes one fix in 2 minutes.

---

### Day 2 close (10 min, 17:15)

Round-the-room:
- One habit you're taking back to work on Monday.
- One thing you'd want to learn next (auth microservices? SAST at CI? threat modelling deeper?).

Facilitator points to [modules/05-ai-security-audit/prompts/copilot-chat-prompts.md](modules/05-ai-security-audit/prompts/copilot-chat-prompts.md) as the "keep-close" reference for their day job.

---

## Cheat-sheet: 10 prompts you'll actually use every week

| When | Prompt |
|---|---|
| New endpoint | Prompt 7.3 — STRIDE the endpoint |
| PR review | Prompt 8.3 — full-file review |
| CVE alert | Prompt 8.1 — triage npm audit |
| SAST run | Prompt 8.2 — triage semgrep |
| Wrote a new middleware | Prompt 6.1 — grade the middleware |
| Login handler change | Prompt 6.2 — timing-safe login check |
| Adding OAuth | Prompt 4.3 — spot missing state/PKCE/nonce |
| Wrote a new Zod schema | "Does this schema still allow mass assignment via optional fields?" |
| Wrote a new SQL query | "Does this query interpolate any user input? If yes, rewrite parametrised." |
| Explaining a bug in PR | Prompt 8.5 (below) — plain-English explanation |

Bonus **Prompt 8.5** — plain-English bug explainer for PR descriptions:
```
Explain the following security bug to a non-security engineer, in 6 lines:
- what it is (1 line),
- how someone would exploit it (2 lines),
- what damage results (1 line),
- what the fix does (2 lines).

No jargon. No CWE IDs unless asked. No breach name-dropping.

--- paste the bug / diff ---
```

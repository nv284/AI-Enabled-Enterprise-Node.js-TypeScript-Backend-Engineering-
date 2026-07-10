# 2-Day Agenda

Total: **~12 hours** of instruction + labs. Adjust breaks to your timezone.

---

## Day 1 — Identity & Access

| Time | Duration | Activity | Deliverable |
|---|---|---|---|
| 09:00 – 09:30 | 30 min | **Module 0** — Intro to web security, threat model of an API | Shared threat model on whiteboard |
| 09:30 – 11:30 | 2 h | **Module 1** — JWT: theory, structure, signing, verification, refresh tokens | JWT playground + first login endpoint |
| 11:30 – 11:45 | 15 min | Break | |
| 11:45 – 13:00 | 1 h 15 | **Module 2** — RBAC: roles, permissions, middleware, tests | `requireRole` middleware |
| 13:00 – 14:00 | Lunch | | |
| 14:00 – 16:00 | 2 h | **Module 3** — OAuth2 / OpenID Connect with Google | Google sign-in working |
| 16:00 – 16:15 | 15 min | Break | |
| 16:15 – 17:15 | 1 h | **Project kickoff** — scaffold Secure Notes API, wire JWT auth | `/auth/register`, `/auth/login`, protected `/notes` |

## Day 2 — Hardening & AI-Assisted Audit

| Time | Duration | Activity | Deliverable |
|---|---|---|---|
| 09:00 – 11:00 | 2 h | **Module 4** — Secure API design: OWASP API Top 10, validation, rate limits, headers, errors | Hardened middleware stack |
| 11:00 – 11:15 | 15 min | Break | |
| 11:15 – 13:00 | 1 h 45 | **Project** — add RBAC, Google sign-in, Zod validation, helmet, rate limits | Feature-complete API |
| 13:00 – 14:00 | Lunch | | |
| 14:00 – 16:00 | 2 h | **Module 5** — AI-assisted security audit: `npm audit`, Semgrep, Copilot Chat prompts, Snyk | Findings report on vulnerable-app |
| 16:00 – 16:15 | 15 min | Break | |
| 16:15 – 17:15 | 1 h | **Capstone** — audit your own Secure Notes API, fix at least 3 findings, present | Fix PR + short write-up |

---

## Facilitation tips

- **Pair up** on exercises when possible — one drives, one navigates.
- After each module do a **5-minute recap** where a random participant explains one concept.
- Keep a shared **"vocab wall"** (JWT, claim, scope, IdP, RP, PKCE, CSRF, etc.). Add to it live.
- End of Day 1: **retro** — one thing learned, one thing confusing.
- End of Day 2: **demo day** — each participant demos their fix from the capstone.

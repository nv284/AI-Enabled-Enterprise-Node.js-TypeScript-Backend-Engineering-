# Secure APIs with Node.js & TypeScript — 2-Day Training

A hands-on, fresher-friendly workshop covering **JWT**, **RBAC**, **OAuth2 / OpenID Connect**, **secure API design**, and **AI-assisted security auditing** — all in **TypeScript + Node.js**.

By the end you will have built and audited a working **Secure Notes API** with user auth, roles, Google sign-in, and hardening against the OWASP API Top 10.

---

## Who this is for

- Junior / fresher developers comfortable with **TypeScript** and **Node.js**.
- No prior security background required.

## What you will build

An end-to-end **Secure Notes API** with:
- Email/password signup + login with **JWT access + refresh tokens**.
- **Role-Based Access Control** (`user`, `admin`).
- **Google Sign-In** via OAuth2 / OIDC.
- Rate limiting, input validation, security headers, structured error handling.
- Automated security audit using `npm audit`, **Semgrep**, and **GitHub Copilot Chat**.

## Repository layout

```
security/
├── README.md              <- you are here
├── SETUP.md               <- one-time environment setup
├── AGENDA.md              <- 2-day schedule with timings
├── modules/               <- teaching modules (concept + labs)
│   ├── 00-intro-security/
│   ├── 01-jwt/
│   ├── 02-rbac/
│   ├── 03-oauth2-oidc/
│   ├── 04-secure-api-design/
│   └── 05-ai-security-audit/
└── project/               <- end-to-end Secure Notes API (build progressively)
```

Each module folder contains:
- `README.md` — concepts, diagrams, code samples, exercises, activities.
- `examples/` — small, runnable snippets that illustrate one idea at a time.
- `exercises/` — starter files and a `SOLUTION.md`.

## How to use this kit

1. Complete `SETUP.md` **before Day 1** (30 min).
2. Follow `AGENDA.md` — each slot maps to a module or a project step.
3. Use `WALKTHROUGH.md` for the minute-by-minute steps, discussion prompts, and Copilot Chat prompts per step.
4. Read the module `README.md`, run the `examples/`, then attempt `exercises/`.
5. Progressively build the `project/` — every module contributes one feature to it.
6. On the final capstone, run an AI-assisted security audit on your own code.

## Prerequisites (short list)

- **Node.js ≥ 20 LTS**, **npm ≥ 10**
- **Git**, **VS Code** (with **GitHub Copilot** enabled if available)
- Optional (but recommended): **Docker Desktop**, **Semgrep**, a free **Google Cloud** account for OAuth
- Full details in [SETUP.md](SETUP.md).

## Guiding principles

> Security is not a feature you bolt on at the end. It is a set of small, boring habits practiced consistently.

- **Least privilege** — never grant more access than needed.
- **Defense in depth** — one broken layer must not compromise the system.
- **Fail closed** — on error, deny access, never grant it.
- **Never trust input** — validate, sanitize, encode at boundaries.
- **Secrets are not code** — they belong in env vars / secret stores.

Let's build.

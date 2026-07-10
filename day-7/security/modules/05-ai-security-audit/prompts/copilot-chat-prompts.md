# Curated Copilot Chat Prompts for Security Audits

Copy-paste these into Copilot Chat when auditing code. **Never paste secrets, tokens, connection strings, or customer data.**

Each prompt is deliberately structured to force citations, refuse-when-unsure, and produce diffs — not vibes.

---

## 1. Full-file security review

```
You are a senior application security engineer. Review the following TypeScript
file for security issues. For each finding, output a row in this table:

| # | file:line | severity | CWE | Issue (1 line) | Exploit sketch (2 lines) | Fix (3 lines of code) |

Rules:
- Only report issues you can point to a specific line for.
- If you are unsure, say "no confident findings" for that category.
- Do not invent CWE IDs; leave blank if unsure.
- Focus areas: broken authN, broken authZ (BOLA / BFLA), input validation,
  injection (SQL/NoSQL/command/prototype), weak crypto & password storage,
  missing rate limits & body-size limits, logging of secrets, mass assignment,
  error/stack leakage, open redirect, SSRF, CSRF.

---
<paste file here>
```

## 2. Triage `npm audit --json`

```
Given this `npm audit --json` output for a Node.js API deployed server-side
(not a browser bundle), group findings into:
- "must fix now": RCE, prototype pollution, auth bypass, injection in a runtime dep.
- "fix this sprint": medium severity in runtime deps.
- "acceptable risk": dev-only deps, or advisories that don't apply on server side (e.g. path-parse in a non-URL-parsing context).

For each item explain WHY it applies or doesn't. Quote only advisory IDs
that appear in the JSON. Output a markdown table sorted by severity desc.

---
<paste audit.json>
```

## 3. Triage Semgrep JSON

```
I ran semgrep with rulesets p/typescript, p/owasp-top-ten, p/nodejsscan plus
custom rules in .semgrep/. For each finding below:

1. Classify: TRUE_POSITIVE / LIKELY_FALSE_POSITIVE / NEEDS_CONTEXT.
2. If TRUE_POSITIVE, propose the smallest safe patch as a unified diff.
3. Group by severity, then CWE.

Cite only rule IDs and file:line that appear in the JSON below.

---
<paste semgrep --json output>
```

## 4. Threat model a new endpoint (STRIDE)

```
I'm adding a new endpoint:

<HTTP METHOD> <path>
Body: <json shape>
Auth: <who can call it>

Threat-model it with STRIDE. For each threat that applies, propose the
concrete control (with code where useful) using our stack:
  - Express + TypeScript + Zod + Prisma + jsonwebtoken.

Output as a table: | STRIDE | Threat | Control | Code snippet |
Skip letters that clearly do not apply.
```

## 5. Draft an exploit for one handler

```
Given the handler below, write:
1. A minimal `curl` command that exploits the vulnerability.
2. A unified diff that fixes it.
3. A one-paragraph explanation.

If the handler is not vulnerable, say "no confident finding".

---
<paste handler>
```

## 6. Diff review before merge

```
You are reviewing this PR for security regressions. Assume the reviewer
already ran unit tests and Semgrep. Focus only on: new auth checks, new
endpoints without validation, changes to password/token handling, new
outbound HTTP calls, new use of raw SQL / eval / Function.

For each concern cite file:line and propose the minimal change.

---
<paste git diff>
```

## 7. Explain a CVE in plain English

```
Explain CVE-<ID> to a fresher developer:
- What kind of bug is it (CWE)?
- Which package versions are affected?
- How would an attacker exploit it in a Node.js Express API?
- What is the safest upgrade path?

If you are not sure about the CVE ID, refuse and say so.
```

## 8. Generate secure boilerplate

```
Write an Express + TypeScript route handler for:
  POST /notes
  body: { title: string(1..200), body: string(0..10000) }
  auth: JWT (HS256, iss=notes-api, aud=notes-web), any role
  db: Prisma model Note { id, userId, title, body, createdAt }

Requirements:
- Zod schema validation with .strict()
- authGuard middleware (assume already imported)
- Correlation id logged, secrets never logged
- Return 201 with created note (no server-internal fields)
- Rate limit reference (do not implement; comment showing how it'd hook in)
```

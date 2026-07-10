# Module 5 — AI-Assisted Security Audit (2 h)

Take a **deliberately vulnerable** mini-app, run three complementary tools on it, and use **AI to accelerate triage and remediation**. Finish by turning the same tools on your own end-to-end project.

## Learning objectives

1. Know what each tool is good (and bad) at:
   - **`npm audit`** — known vulnerable dependencies (CVEs).
   - **Semgrep** — pattern-based **static** analysis of your **own** code.
   - **Snyk** — deps + code + IaC scanning (SaaS with a free tier).
   - **GitHub Copilot Chat** — LLM code review, exploit prototyping, remediation drafting.
2. Chain them: **deps → SAST → LLM review**.
3. Write disciplined **AI prompts** so results are actionable, not hallucinated.
4. Verify every AI suggestion — LLMs will confidently invent APIs and CVE IDs.

---

## 1. Tool matrix

| Tool | Catches | Misses | Effort |
|---|---|---|---|
| `npm audit` | Vulnerable **dependencies** with known CVEs | Your own logic bugs | 30 seconds |
| **Semgrep** | Pattern-based bugs in **your code** (SQLi, weak crypto, missing auth checks) | Deep logic bugs, chained flows | 2 min per repo |
| **Snyk** | Deps + some SAST + secret leaks + IaC | Novel bugs | Sign-up, free tier |
| **Copilot Chat** | Reviews arbitrary code, explains findings, drafts fixes, spots business-logic issues | Confident hallucinations; is not deterministic | Interactive |
| Manual review | Everything else | Slow | Hours per file |

**Use all three levels.** Each catches what the others miss.

## 2. The vulnerable app

`vulnerable-app/` is a small Express + TypeScript API with **at least 8 planted bugs** across:

- SQL injection (raw `$queryRawUnsafe`),
- Weak password hashing (SHA-256),
- Broken authorization (BOLA),
- JWT `alg` not whitelisted,
- Prototype pollution via `Object.assign(target, req.body)`,
- Hardcoded secret in source,
- Open redirect,
- No rate limits,
- Verbose error handler.

Do **not** deploy this. It lives here purely for tooling practice.

## 3. Step 1 — `npm audit`

```powershell
cd modules/05-ai-security-audit/vulnerable-app
npm install
npm audit --omit=dev
npm audit --json > audit.json
```

Then pass it to Copilot Chat (see § 6). Expected: a handful of transitive advisories. Some are false positives for server-side code (path-parse etc.), some are real (e.g. an outdated `jsonwebtoken`).

Also try:

```powershell
npm audit fix              # applies safe non-breaking fixes
npm audit fix --force      # allows major version bumps — read the diff!
```

## 4. Step 2 — Semgrep (SAST)

Semgrep runs pattern rules over your source. It has a large **community ruleset**.

### With Python:
```powershell
semgrep --config p/typescript --config p/owasp-top-ten --config p/nodejsscan .
```

### With Docker:
```powershell
docker run --rm -v ${PWD}:/src returntocorp/semgrep semgrep --config p/typescript --config p/owasp-top-ten --config p/nodejsscan /src
```

Add a custom rule catching **JWT verify without algorithms whitelist**:

`.semgrep/jwt-verify-no-algorithms.yml`
```yaml
rules:
  - id: jwt-verify-no-algorithms
    languages: [typescript, javascript]
    severity: ERROR
    message: >
      jwt.verify must be called with an explicit `algorithms` array.
      Otherwise the "alg" header may be manipulated by an attacker.
    patterns:
      - pattern-either:
          - pattern: jwt.verify($TOKEN, $KEY)
          - pattern: jwt.verify($TOKEN, $KEY, { ... })
      - pattern-not: jwt.verify($TOKEN, $KEY, { algorithms: [...], ... })
```

Run it:

```powershell
semgrep --config .semgrep .
```

## 5. Step 3 — Snyk (optional)

```powershell
snyk auth
snyk test              # deps
snyk code test         # SAST
snyk iac test          # if you have terraform / bicep / k8s
```

Snyk gives severity, exploit maturity, and a "fix version" per finding — useful for triage but requires an account.

## 6. Step 4 — AI-assisted review with Copilot Chat

The tools above surface **where** issues might be. **Copilot Chat helps you triage them fast** and draft fixes. Keys to good prompts:

1. Give it **code + tool output**, not just a question.
2. Ask for **a specific format** — a table of {file, line, cwe, severity, exploit sketch, fix}.
3. Force it to cite the **line numbers** — makes hallucinations easy to spot.
4. Ask for **exploits and fixes**, not just descriptions.
5. Ask it to **refuse** issues it isn't sure about.

### Prompt library (copy-paste)

Store these in `prompts/` and reuse across projects.

**Prompt 1 — Full-file review**

```
You are a senior application security engineer. Review the following TypeScript
file for security issues. For each finding, output a row in this table:

| # | file:line | severity | CWE | Issue (1 line) | Exploit sketch (2 lines) | Fix (3 lines of code) |

Only report issues you can point to a specific line for. If you are unsure,
say "no confident findings". Do not invent CWE IDs. Focus on: broken authN,
broken authZ (BOLA/BFLA), input validation, injection, weak crypto, missing
rate limits, logging of secrets, mass assignment, error leakage.

---
<paste file>
```

**Prompt 2 — Triage npm audit output**

```
Given this `npm audit --json` output for a Node.js API, group findings by
- "must fix now" (RCE, prototype pollution, auth bypass, in a runtime dep),
- "fix this sprint" (medium severity in runtime deps),
- "acceptable risk" (dev-only deps, or advisory does not apply on server side).

For each item explain WHY it does or doesn't apply to a server-side Express
app. Output as a markdown table. Do not invent CVE IDs — quote only IDs that
appear in the JSON.
```

**Prompt 3 — Triage Semgrep output**

```
I ran semgrep with the following rulesets: p/typescript, p/owasp-top-ten,
p/nodejsscan and a custom rule jwt-verify-no-algorithms.

Below is the JSON output. For each finding:
1. Say whether it's a true positive, likely false positive, or "need more context".
2. If true positive, propose the smallest safe fix as a code diff.
3. Group by severity and by CWE.

<paste semgrep --json output>
```

**Prompt 4 — Threat-model a new endpoint**

```
I'm adding a new endpoint:

POST /notes/:id/share
Body: { emails: string[], expiresInDays?: number }

Threat-model it using STRIDE. For each threat that applies, propose the
concrete control (with code where relevant, using Express + Zod + Prisma).
```

**Prompt 5 — Exploit a specific bug**

```
Given the handler below, write a minimal curl command that exploits it,
and then a diff that fixes it. Explain in one paragraph what the fix does
and why the original was vulnerable.

<paste handler>
```

## 7. Guardrails when using AI for security

- **Never paste secrets.** Redact tokens, passwords, connection strings, env values before prompting.
- **Verify every CVE ID** with the NVD database — LLMs invent them.
- **Run the fix.** LLMs often produce code that doesn't compile or uses APIs from the wrong library version.
- **Ask "what did you miss?"** — then re-prompt with the file focused on that area.
- **Don't chain fixes blindly.** Fix one thing, re-run tests + tools, then move on.

## 8. Exercises

`exercises/README.md`. Highlights:

- Run `npm audit` on `vulnerable-app/`, produce triage table via Copilot Chat.
- Run Semgrep with community + custom rule, produce fixes via Copilot Chat.
- Write **one new Semgrep rule** for a pattern you found manually.
- Turn the whole audit on your own project from Day 1. Fix ≥ 3 real findings.

## 9. Activity — "AI vs Human" bug hunt (30 min)

1. Everyone gets 15 min with **only human eyeballs** on `vulnerable-app/src/routes/notes.ts`.
2. List the bugs you found on paper.
3. Now feed the same file to Copilot Chat with **Prompt 1**.
4. Compare lists. Score:
   - True positives found only by human: +1
   - True positives found only by AI: +1
   - False positives from AI: -1
5. Discuss: which categories were you better at? Which was AI better at?

## Cheat-sheet

- `npm audit` → deps.
- Semgrep → your code (patterns).
- Copilot Chat → triage + fix drafts.
- **AI is a force multiplier, not an oracle.** Trust nothing without verifying.

## Further reading

- OWASP AI Security & Privacy Guide: https://owasp.org/www-project-ai-security-and-privacy-guide/
- Semgrep rules: https://semgrep.dev/explore
- GitHub Copilot documentation on secure code reviews: https://docs.github.com/en/copilot
- Snyk vuln DB: https://security.snyk.io
- NVD (verify CVE IDs): https://nvd.nist.gov

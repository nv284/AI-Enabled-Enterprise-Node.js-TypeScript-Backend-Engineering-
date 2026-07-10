# Module 5 — Exercises

Estimated: **1 h 30 min** in class + capstone.

## Ex 1 — `npm audit` triage (15 min)

1. `cd modules/05-ai-security-audit/vulnerable-app`
2. `npm install`
3. `npm audit --json > audit.json`
4. Skim `audit.json`. Count total advisories.
5. Open Copilot Chat, paste **Prompt 2** from `prompts/copilot-chat-prompts.md` followed by the JSON.
6. Fill in `findings/deps.md` with the resulting triage table.
7. Verify: pick **one** "must fix" CVE ID from the AI output and confirm it on https://nvd.nist.gov. Was the AI's severity right?

## Ex 2 — Semgrep scan (25 min)

Run community rulesets:

```powershell
semgrep --config p/typescript --config p/owasp-top-ten --config p/nodejsscan src -j > semgrep.json
```

Then include the custom rules:

```powershell
semgrep --config .semgrep --config p/typescript src -j > semgrep-custom.json
```

Paste `semgrep-custom.json` into Copilot Chat with **Prompt 3**. Save the triaged output to `findings/sast.md`.

**Bonus:** you'll notice `jwt-verify-no-algorithms` fires on `src/index.ts` **twice**. Good — two separate handlers were vulnerable.

## Ex 3 — Write one new Semgrep rule (20 min)

Find a pattern in `src/index.ts` that none of the shipped rules catch. Pick one of:

- `new Function(...)` with user input,
- `res.status(500).send(err.stack)`,
- `console.log(...password...)`.

Write a rule in `.semgrep/my-rules.yml` and confirm it fires.

## Ex 4 — Copilot Chat full-file review (25 min)

Paste **Prompt 1** followed by the entire `src/index.ts` into Copilot Chat.

- Compare AI output to your Semgrep findings.
- What did AI catch that Semgrep missed? (Look for logic issues like open redirect, verbose error handler, weak hash algorithm choice, mass assignment.)
- What did Semgrep catch that AI missed?
- Any **false positives** from AI? Note them in `findings/ai-review.md` with your reasoning.

## Ex 5 (capstone) — Audit your OWN project (45 min)

Now run the same three tools on `project/` (the Secure Notes API you built on Day 1).

1. `npm audit`.
2. Semgrep with community rules + `modules/05-ai-security-audit/vulnerable-app/.semgrep/rules.yml`.
3. Copilot Chat: **Prompt 1** for each of your route files.
4. Pick **at least 3 real findings** and fix them.
5. Write a short `AUDIT.md` in `project/` describing what you found, what you fixed, and what you decided to defer (with justification).

## Rules of engagement

- Never paste secrets into Copilot Chat. Redact `.env` values before sharing snippets.
- Verify every CVE ID before quoting it in a report.
- If Copilot's fix doesn't compile or breaks a test, **do not merge it** — refine the prompt.

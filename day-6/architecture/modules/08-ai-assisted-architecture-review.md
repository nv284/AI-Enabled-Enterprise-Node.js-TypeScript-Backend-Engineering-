# Module 8 — AI-Assisted Architecture Review

> **Goal:** Learn how to use an AI chat as a *disciplined reviewer*: prompt patterns that catch layer violations, hidden coupling, and bad naming — and how to verify the AI is not hallucinating.

**Time:** 75 minutes.

---

## 8.1 What AI is (and isn't) good at, for architecture

| AI is good at | AI is bad at |
|---|---|
| Spotting patterns across many files at once | Knowing your organization's conventions |
| Applying well-known rules (dependency rule, SRP) | Predicting runtime behavior |
| Suggesting names and refactorings | Reasoning about performance |
| Generating diagrams from code | Guaranteeing correctness of its own claims |

**Rule of engagement:** treat every AI suggestion as a **hypothesis**. You verify with code, tests, or a static-analysis tool. Module 9 covers the tools that make verification cheap.

---

## 8.2 The four review prompts you will reuse forever

All four are in copy-pasteable form in [../prompts/](../prompts/).

### Prompt 1 — Layer-violation scan

```
You are reviewing a TypeScript Node.js project that intends to follow Clean Architecture with four layers:
- domain      (entities + repository interfaces, no framework imports)
- application (services orchestrating domain)
- infrastructure (concrete adapters — DB, HTTP clients, mailers)
- presentation (Express controllers, CLI, gRPC)

Dependency rule: source imports must only point inward
(presentation → application → domain, infrastructure → domain).

For each file I paste, report:
1. Which layer it belongs to (based on its path).
2. Any import that violates the dependency rule, with the exact line.
3. Any code inside the file that doesn't belong to that layer
   (e.g. SQL inside a service, `res.status` inside a domain class).
4. A one-line suggested fix for each violation.

Be terse. If a file is clean, say "OK".
Here is the first file:
<paste file contents>
```

### Prompt 2 — Service smell hunt

```
You are reviewing a TypeScript service class. Check for these smells and report ONLY the ones you find, each with the offending line:

- Constructor takes concrete classes instead of interfaces.
- Method takes an HTTP Request/Response object.
- Method returns an HTTP response object.
- SQL string literals inside the file.
- `new` calls to infrastructure classes (DB, mailer, HTTP client).
- Method longer than 30 lines.
- Method name that isn't a business verb ("doStuff", "handle", "process").
- Multiple unrelated responsibilities (list each).
- Missing typed error classes (catches or returns strings/objects instead).

For each smell, suggest a one-line fix.
File:
<paste>
```

### Prompt 3 — Repository conformance check

```
Given this repository interface and its SQLite implementation, verify:

1. The interface uses only domain types (no RowDataPacket, no `any`).
2. Method names describe business intent, not SQL operations
   (bad: `selectWhere`, good: `findActiveOrdersByCustomer`).
3. The implementation returns fully-mapped domain objects (no raw rows leak).
4. Every method in the interface has an implementation (and vice versa).
5. No business rule (comparisons, discounts, thresholds) appears in the implementation.

Report findings as a checklist. For each ✗ item, quote the offending code.

Interface:
<paste>

Implementation:
<paste>
```

### Prompt 4 — Diagram-from-code

```
Read the files I paste. Produce a Mermaid `flowchart LR` diagram that shows:
- One node per class or module.
- One arrow per import between them.
- Group nodes into subgraphs by top-level folder (domain / application / infrastructure / presentation).

Then list, separately, any arrow that violates the dependency rule
(presentation → application → domain, infrastructure → domain).

Files:
<paste each with its path>
```

---

## 8.3 Prompting patterns that work

### Pattern A — Give it the rules, not just the code

AI does poorly with "*is this good?*" and well with "*does this satisfy rules X, Y, Z?*". Every prompt above **states the standard** first, then asks for a check.

### Pattern B — Ask for evidence, not opinions

Bad:

> "Is this service well-designed?"

Better:

> "For each of these 7 smells, list the offending lines. If none, say 'OK'."

Evidence-shaped prompts are **auditable**. You can look at the line and agree or disagree.

### Pattern C — Chunk the review

Don't paste 40 files at once. Review one file, take the notes, move on. AI attention degrades quickly with volume.

### Pattern D — Verify before applying

Never let the AI directly patch code you haven't read. Ask:

> "Show the diff you would apply. Do not apply it."

Then read, then apply manually or accept.

### Pattern E — Ask "what would break?"

Great AI review question:

> "If I made the change you just proposed, what tests would fail? What tests should I add to catch regressions?"

Forces the AI to reason about consequences.

---

## 8.4 A worked example — reviewing the v3 case study

Say we've reached [v3-repository-pattern](../case-study/v3-repository-pattern/) and want a pre-merge review.

**Step 1** — open the chat, paste **Prompt 1** with `src/application/OrderService.ts`.
Expected AI output (something like):

> Layer: application. OK. No dependency-rule violations.

**Step 2** — paste `src/presentation/http/orderController.ts`.
Expected:

> Layer: presentation. Line 5 imports `SqliteBookRepository` from infrastructure — presentation should only depend on application. Suggested fix: inject the service via `main.ts` instead.

**Step 3** — paste **Prompt 3** with the repository interface + SQLite impl.
Expected:

> ✗ Interface method `queryBooks(sql: string)` violates rule 2. Rename to intention-revealing method.

**Step 4** — verify. Open `dependency-cruiser` (Module 9) or read the flagged lines. Fix.

**Step 5** — re-run the same prompt to confirm.

This loop — **prompt → read → verify → fix → re-prompt** — is the entire practice.

---

## 8.5 Failure modes to watch for

| AI mistake | How to catch it |
|---|---|
| **Hallucinated import** — flags a line that doesn't exist | Always check the line number |
| **Rule confusion** — says a domain file imports Express when it doesn't | Re-paste with line numbers; ask "quote the exact import" |
| **Style opinion masquerading as rule** — "you should use arrow functions" | Ignore anything outside your stated rules |
| **Overconfident refactor** — proposes a large restructuring | Ask "the smallest change that fixes this" |
| **Fabricated tool output** — pretends it ran `madge` | Never trust; run tools yourself (Module 9) |

---

## 8.6 A prompt to *bootstrap* your standards

Give the AI your team's rules once, saved as a system message or a project instructions file:

```
You are the architecture reviewer for a Node.js + TypeScript project.
Enforce these rules on every review:

RULES
1. Layers: domain, application, infrastructure, presentation.
2. Dependency rule: only presentation→application→domain, infrastructure→domain.
3. `domain/` may import zod only; no other libraries.
4. Services take interfaces (ports) via constructor, never concrete classes.
5. Services throw typed errors from `domain/errors.ts`; controllers translate to HTTP.
6. Repository methods are named in business language, not SQL.
7. `main.ts` is the only file allowed to `new` an infrastructure class.
8. Every service method fits the pattern: load → decide → persist.

For any code I paste, list only violations with file:line and a one-line fix.
Ignore stylistic issues.
```

Now every subsequent prompt inherits the standard.

---

## 8.7 Comparison — human review vs AI-assisted review

| | Solo human | AI-assisted (done right) |
|---|---|---|
| Speed on 20-file PR | Slow; skims later files | Fast; consistent across all files |
| Enforces stated rules | Sometimes forgets | Robotically applies |
| Catches novel design flaws | ✅ humans still win | Often misses |
| Catches naming inconsistencies | Often overlooked | Excellent |
| False positives | Rare | Common — must verify |
| Team learning | High (discussion) | Medium (still a good teacher) |

**Best combo:** AI does the mechanical layer check; human does the design conversation.

---

## 8.8 Activity — review the messy v1 (30 minutes)

1. Open [case-study/v1-messy-monolith/src/index.ts](../case-study/v1-messy-monolith/src/index.ts).
2. Paste it into your AI chat along with **Prompt 1** and **Prompt 2**.
3. Copy the AI's findings into a new file `review-notes.md`.
4. Now — *without* looking at v4 yet — write your own review of the same file, from memory of Modules 1–7.
5. Compare. Which findings did you both catch? Which did each of you miss?

The point is not to compete with AI. It's to feel where it complements you.

---

## 8.9 Key takeaways

- AI is a **rule enforcer**, not a designer.
- Give it **your rules**, then ask for **evidence**, not opinions.
- Chunk reviews; verify every line-level claim.
- Combine with tools (next module) so verification is one command.
- Best value: catching layer violations and inconsistent naming across many files.

Next: [Module 9 — Dependency analysis with AI + tools](09-dependency-analysis-with-ai.md), where we make architecture violations impossible to merge.

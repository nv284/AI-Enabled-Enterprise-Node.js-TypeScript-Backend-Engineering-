# Capstone Grading Rubric

Total: **100 points**. Pass ≥ 70. Merit ≥ 85. Distinction ≥ 95.

Reviewers should be able to grade by inspecting the repo + running `npm test` and `npm run arch:check`.

---

## A. Architecture layering — 25 pts

| Criterion | Full | Partial | Zero |
|---|---|---|---|
| Four folders (domain / application / infrastructure / presentation) exist | 5 | 2 | 0 |
| `grep -r "express\|better-sqlite3" src/domain src/application` returns nothing | 5 | — | 0 |
| Every service takes repository **interfaces** (not concrete classes) via constructor | 5 | 2 | 0 |
| `main.ts` is the only file with `new Sqlite*Repository` | 5 | 2 | 0 |
| `.dependency-cruiser.js` enforces the 4 layer rules and passes | 5 | 2 | 0 |

---

## B. Repository pattern — 15 pts

| Criterion | Full | Partial | Zero |
|---|---|---|---|
| One repository interface per aggregate (User, Project, Task, Comment) | 4 | 2 | 0 |
| Interface methods use business language (no `select…` / `insert…`) | 4 | 2 | 0 |
| Implementations map rows → domain objects; no raw rows escape | 4 | 2 | 0 |
| Cascade delete implemented in a transaction | 3 | 1 | 0 |

---

## C. Service layer — 15 pts

| Criterion | Full | Partial | Zero |
|---|---|---|---|
| Every business rule lives in a service (grep the 7 rules → all in services) | 5 | 2 | 0 |
| Services throw typed errors from `domain/errors.ts` | 4 | 2 | 0 |
| Each service method follows load→decide→persist (or is <10 lines) | 3 | 1 | 0 |
| Class + method names read as business sentences | 3 | 1 | 0 |

---

## D. Testing — 20 pts

| Criterion | Full | Partial | Zero |
|---|---|---|---|
| ≥ 1 unit test per public service method (happy path) | 5 | 2 | 0 |
| ≥ 1 unhappy-path unit test per service method that has a rule | 5 | 2 | 0 |
| ≥ 1 integration test per repository, using `:memory:` SQLite | 4 | 2 | 0 |
| ≥ 3 E2E tests covering golden paths | 3 | 1 | 0 |
| Tests use **fakes**, not `.mock.calls` interaction assertions | 3 | 1 | 0 |

---

## E. Automated review + tooling — 10 pts

| Criterion | Full | Partial | Zero |
|---|---|---|---|
| `npm run arch:cycles` returns "No circular dependency found" | 3 | — | 0 |
| `npm run arch:check` exits 0 | 3 | — | 0 |
| CI workflow present and runs the above + tests | 2 | 1 | 0 |
| `npm run arch:graph` produces a readable dependency picture | 2 | 1 | 0 |

---

## F. Documentation + AI reflection — 10 pts

| Criterion | Full | Partial | Zero |
|---|---|---|---|
| README with clear run/test steps + 4-layer Mermaid diagram | 3 | 1 | 0 |
| README "design decisions" section with ≥ 3 justified choices | 3 | 1 | 0 |
| `docs/ai-review.md` shows one review pass, findings, and your accept/reject notes | 2 | 1 | 0 |
| `docs/ai-usage.md` shows self-awareness about prompt engineering | 2 | 1 | 0 |

---

## G. Presentation defense — 5 pts

- 2 pts — walkthrough covers all 4 slides in ≤ 10 min.
- 2 pts — answers "*why did you put X in layer Y?*" convincingly.
- 1 pt — reviewers' live commands (`npm test`, `npm run arch:check`) both pass.

---

## Automatic deductions

- **-10 pts** — any layer rule violation not detected by your own config.
- **-10 pts** — SQL string found in `src/application/`.
- **-5 pts** — service method takes `Request` or returns `Response`.
- **-5 pts** — a domain class imports Express, `better-sqlite3`, `fs`, or `axios`.
- **-5 pts** — tests reach 90%+ pass rate only after `beforeAll` seeding that isn't reset per test.

---

## Bonus (up to +10, cannot exceed 100 total)

- **+3** — added a **second** infrastructure implementation (e.g., `InMemoryTaskRepository` used by an alternate `main.dev.ts`) and it works.
- **+3** — added a **CLI** presentation adapter that reuses services (proves layer independence).
- **+2** — added mutation testing (Stryker) with reasonable score.
- **+2** — added OpenAPI spec generated from the router.

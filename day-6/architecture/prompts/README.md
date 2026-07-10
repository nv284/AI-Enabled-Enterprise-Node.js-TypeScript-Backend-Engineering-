# Reusable AI Prompts

Copy any of these into your AI chat. They match the modules and case-study steps by number.

---

## Prompt 1 — Layer-violation scan

```
You are reviewing a TypeScript Node.js project that follows Clean Architecture:
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

First file:
<paste>
```

## Prompt 2 — Service smell hunt

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

## Prompt 3 — Repository conformance check

```
Given this repository interface and its SQLite implementation, verify:

1. The interface uses only domain types (no RowDataPacket, no `any`).
2. Method names describe business intent, not SQL operations.
3. The implementation returns fully-mapped domain objects (no raw rows leak).
4. Every method in the interface has an implementation (and vice versa).
5. No business rule (comparisons, discounts, thresholds) appears in the implementation.

Report findings as a checklist. For each ✗ item, quote the offending code.

Interface:
<paste>

Implementation:
<paste>
```

## Prompt 4 — Diagram-from-code

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

## Prompt 5 — Interpret dependency-cruiser output

```
Below is the output of `npx depcruise --config .dependency-cruiser.js src`
on my Node.js + TypeScript project that follows Clean Architecture.

For each violation:
1. Restate it in one sentence a junior can understand.
2. Explain WHY the rule exists (what pain it prevents).
3. Give the minimum-change fix. Show a code diff if possible.
4. Suggest one test that would fail if the fix regresses.

Output:
<paste depcruise output>
```

## Prompt 6 — Explain and break a cycle

```
Here is a circular dependency reported by `madge --circular`:
A → B → C → A

Explain, step by step:
1. Why cycles are harmful in TypeScript (compilation, testing, reasoning).
2. Three standard techniques to break this specific cycle
   (extract interface, invert dependency, move shared code).
3. Which technique fits best given these three files (I'm pasting them below).

Files:
<paste A, B, C>
```

## Prompt 7 — Save-me-as-a-standard (system prompt / instructions)

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

## Prompt 8 — Extract a service (v1 → v2)

```
I have this Express file (paste). It mixes HTTP, SQL, and business rules.

Refactor it so that:
- Business rules move into `src/services/OrderService.ts` and `src/services/CatalogService.ts`.
- Each service takes the `Database` object via constructor.
- Controllers stay in `src/index.ts` and only translate requests/responses.
- Domain errors are thrown from services; controllers map them to HTTP.

Do not introduce interfaces yet. Do not change SQL.
Show the resulting file tree first, then each file's contents.
```

## Prompt 9 — Introduce repositories (v2 → v3)

```
Take the v2 project (paste OrderService and CatalogService).

Refactor to introduce the Repository Pattern:
- Create `src/domain/ports/BookRepository.ts` and `OrderRepository.ts` — interfaces only.
- Move all SQL into `src/infrastructure/persistence/SqliteBookRepository.ts` and `SqliteOrderRepository.ts`.
- Services now take REPOSITORY INTERFACES, not the Database.
- Wire the concrete repositories in `src/index.ts`.

Verify: no SQL string appears in `src/services/` after refactor.
```

## Prompt 10 — Apply layers (v3 → v4)

```
Reorganize v3 into strict Clean Architecture layers:

src/
  domain/       (entities, ports, errors — no framework imports)
  application/  (services — moved from src/services/)
  infrastructure/persistence/  (SQLite adapters)
  presentation/http/           (Express controllers + router)
  main.ts       (composition root — the only file that constructs concretes)

Update all imports. Do not change behavior. Confirm every domain file imports nothing outside `src/domain/`.
```

## Prompt 11 — Introduce a DI container (v4 → v5)

```
Take v4 and introduce `tsyringe`:
- Add `@injectable()` to services.
- Register `BookRepository` and `OrderRepository` tokens in `main.ts`.
- Resolve top-level services from the container.
- Add `import 'reflect-metadata'` at the top of `main.ts`.

Preserve all behavior. Show `main.ts` and one service so I can see the decorators.
```

## Prompt 12 — Add tests + arch gates (v5 → v6)

```
For v6:
1. Add Vitest.
2. Write unit tests for OrderService using in-memory fakes for repositories.
   Cover: happy path, loyalty discount at 3+ orders, book-not-found, out-of-stock.
3. Write an integration test for SqliteBookRepository using `:memory:` SQLite.
4. Add `madge` and `dependency-cruiser` as dev deps.
5. Add `.dependency-cruiser.js` enforcing the layering rules from Module 9.
6. Add npm scripts: `test`, `arch:cycles`, `arch:check`.

Confirm all tests pass and `arch:check` reports 0 violations.
```

## Prompt 13 — Design review before coding

```
I'm about to build the following feature:
<paste requirements in prose>

Before writing code, help me think through it as Clean Architecture:
1. What domain concept(s) are new?
2. What use case(s) does this add? Suggest service class + method names.
3. What new ports (repository/notifier/etc.) do we need?
4. What existing code do we touch, and why?
5. What tests should exist BEFORE the code (list them by name)?

Be terse. Bullet lists.
```

## Prompt 14 — Naming review

```
Review the following names for a Clean Architecture app. For each, say whether it's good (why) or bad (better name).

- OrderManager
- doOrderThing
- OrderService.processOrder
- UserHelper
- SqliteRepo
- CatalogService.addBook
- OrderRepository.selectByWhere
- NotifierAdapter

Rules:
- Services: `<Aggregate>Service`, methods are business verbs.
- Repositories: `<Aggregate>Repository`, methods speak business.
- No generic words: Manager, Helper, Util, Processor, Handler (in domain).
```

## Prompt 15 — Test-plan review

```
Here is my current test file for a service. Verify:

1. Every public method has ≥ 1 happy-path and ≥ 1 unhappy-path test.
2. Tests use fakes (in-memory repos), NOT mocks with `.mock.calls`.
3. Each `it` name describes a behavior, not an implementation
   ("applies loyalty discount at 3 orders", NOT "calls countByCustomer").
4. `beforeEach` fully resets state.
5. No test depends on another test's ordering.

List missing tests as `describe > it` names.
```

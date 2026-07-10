# Case Study — The Bookstore API, refactored six ways

One project, six versions, each strictly better than the last. Follow along in order — every step includes:

- What we're changing.
- The **AI prompt** you would use to arrive at this step.
- What the change *bought* us.
- A "run it" section.

**Domain:** a tiny online bookstore.
**Features across all versions:**

- `GET /health` — is the app alive?
- `GET /books` — list all books.
- `POST /books` — add a book (admin).
- `POST /orders` — place an order (with the loyalty-discount rule).
- `GET /orders/:id` — fetch an order.

---

## Roadmap

| # | Version | Focus | Read |
|---|---|---|---|
| 1 | [`v1-messy-monolith`](v1-messy-monolith/) | Everything in one file | Understand the pain |
| 2 | [`v2-service-extracted`](v2-service-extracted/) | Pull business rules into services | Feel the first win |
| 3 | [`v3-repository-pattern`](v3-repository-pattern/) | Hide SQL behind interfaces | Business code goes DB-agnostic |
| 4 | [`v4-clean-architecture`](v4-clean-architecture/) | Four layers, dependency rule | The full picture |
| 5 | [`v5-dependency-injection`](v5-dependency-injection/) | `tsyringe` container | Wiring at scale |
| 6 | [`v6-ai-reviewed`](v6-ai-reviewed/) | Tests + `madge` + `depcruise` + AI review | Production-shape |

Each version is a **standalone** Node project. `cd` into it, `npm install`, `npm run dev`.

---

## The AI prompts, in order

Copy these into your AI chat as you move between versions. They are also in [../prompts/](../prompts/).

### Step 1 → 2: extract a service

```
I have this Express file (paste). It mixes HTTP, SQL, and business rules.

Refactor it so that:
- Business rules move into `src/services/OrderService.ts` and `src/services/CatalogService.ts`.
- Each service takes the `Database` object via constructor (we'll invert that next step).
- Controllers stay in `src/index.ts` and only translate requests/responses.
- Domain errors are thrown from services; controllers map them to HTTP.

Do not introduce interfaces yet. Do not change SQL.
Show the resulting file tree first, then each file's contents.
```

### Step 2 → 3: introduce the repository pattern

```
Take the v2 project (paste OrderService and CatalogService).

Refactor to introduce the Repository Pattern:
- Create `src/domain/ports/BookRepository.ts` and `OrderRepository.ts` — interfaces only.
- Move all SQL into `src/infrastructure/persistence/SqliteBookRepository.ts` and `SqliteOrderRepository.ts`.
- Services now take REPOSITORY INTERFACES, not the Database.
- Wire the concrete repositories in `src/index.ts`.

Verify: no SQL string appears in `src/services/` after refactor.
```

### Step 3 → 4: apply Clean Architecture layout

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

### Step 4 → 5: introduce DI container

```
Take v4 and introduce `tsyringe`:
- Add `@injectable()` to services.
- Register `BookRepository` and `OrderRepository` string tokens in `main.ts`.
- Resolve top-level controllers from the container.
- Add `import 'reflect-metadata'` at the top of `main.ts`.

Preserve all behavior. Show `main.ts` and one service so I can see the decorators.
```

### Step 5 → 6: add tests and enforce architecture

```
For v6:
1. Add Vitest.
2. Write unit tests for OrderService using in-memory fakes for repositories.
   Cover: happy path, loyalty discount at 3+ orders, book-not-found, out-of-stock.
3. Write an integration test for SqliteBookRepository using `:memory:` SQLite.
4. Add `madge` and `dependency-cruiser` as dev deps.
5. Add `.dependency-cruiser.js` enforcing:
   - no circular deps
   - domain imports only zod
   - application imports only domain
   - infrastructure imports only domain
   - presentation imports only application
6. Add npm scripts: `test`, `arch:cycles`, `arch:check`.

Confirm all tests pass and `arch:check` reports 0 violations.
```

---

## Suggested reading rhythm

1. **First pass**: read only the `README.md` of every version, in order. No code. ~20 minutes. You'll see the story.
2. **Second pass**: open v1 and v4 side-by-side. Same feature (place order), two shapes. Follow one HTTP request through both.
3. **Third pass**: type out v2 → v3 by hand from v1, using the prompts above. Muscle memory matters.
4. **Fourth pass**: run tests in v6. Delete a test. Break a rule. Re-run `arch:check`.

---

## Recap of what each step buys you

| From → To | Problem it solves | What now becomes possible |
|---|---|---|
| v1 → v2 | Business rules buried in HTTP handlers | Test a rule without a request; two routes can share a rule |
| v2 → v3 | Services still know SQL | Swap DB; test services without a real DB |
| v3 → v4 | Folder layout hides intent | New hire finds any concept in 10 seconds |
| v4 → v5 | Manual wiring grows | Per-env configs; less boilerplate as app grows |
| v5 → v6 | No safety net | Automated review, gated CI, confidence to refactor |

Each step's `README.md` shows a **before/after diff** and a **payoff summary**.

Start now: [v1-messy-monolith/](v1-messy-monolith/).

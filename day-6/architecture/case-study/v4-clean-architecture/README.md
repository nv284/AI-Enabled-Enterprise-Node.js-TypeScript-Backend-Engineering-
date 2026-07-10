# v4 — Clean Architecture

**Four layers. Dependency rule enforced by folder structure and convention.**

## Run

```powershell
npm install
npm run dev
```

## Folder shape

```
src/
├── domain/                 pure TS — entities, ports, errors
│   ├── Book.ts
│   ├── Order.ts
│   ├── errors.ts
│   └── ports/
│       ├── BookRepository.ts
│       └── OrderRepository.ts
├── application/            use-case services
│   ├── OrderService.ts
│   └── CatalogService.ts
├── infrastructure/         adapters (DB, HTTP clients, mailers)
│   └── persistence/
│       ├── db.ts
│       ├── SqliteBookRepository.ts
│       └── SqliteOrderRepository.ts
├── presentation/           delivery (HTTP now; add CLI/gRPC anytime)
│   └── http/
│       ├── bookController.ts
│       ├── orderController.ts
│       ├── router.ts
│       └── middleware.ts
└── main.ts                 composition root — the ONLY new()-ing file
```

## What changed vs v3

| Aspect | v3 | v4 |
|---|---|---|
| Folder = layer | Partial | Strict |
| Composition root | Buried in `index.ts` | Dedicated `main.ts`, factory function |
| Testable app factory | ❌ | ✅ `buildApp({ dbFile: ':memory:' })` |
| Validation library | Hand-rolled | `zod` (bounded, in application layer) |
| Router file | Inline | `presentation/http/router.ts` |
| Error middleware | Inline | `presentation/http/middleware.ts` |

## What got better

1. **Grep test 1:** `grep -r "express" src/domain src/application` → **zero hits**.
2. **Grep test 2:** `grep -r "better-sqlite3" src/application` → **zero hits**.
3. `main.ts` is your **architecture diagram, as code**. Read it top-to-bottom in 60 seconds.
4. `buildApp({ dbFile: ':memory:' })` lets tests spin up the app without touching disk.
5. Adding a **CLI** = new `presentation/cli/` folder that calls the same services. Zero domain changes.

## Verify the dependency rule (manually — automated in v6)

```powershell
# domain must import nothing but zod (or nothing at all)
Select-String -Path src/domain -Pattern "^import" -SimpleMatch:$false

# application must not import infrastructure or presentation
Select-String -Path src/application -Pattern "(infrastructure|presentation)"

# infrastructure must not import application or presentation
Select-String -Path src/infrastructure -Pattern "(application|presentation)"
```

Each command should return **no matches** (except zod in application).

## What's still off (motivates v5)

- `main.ts` is fine at ~30 lines. In a bigger app it becomes unwieldy — a container helps.
- No safety net if someone accidentally imports across layers — that gets automated in v6.

## AI prompt to arrive at v5

See "Step 4 → 5" in [../README.md](../README.md#the-ai-prompts-in-order).

Next: [../v5-dependency-injection/](../v5-dependency-injection/).

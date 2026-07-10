# v3 — Repository Pattern

**SQL disappears from services. Services depend on interfaces they own.**

## Run

```powershell
npm install
npm run dev
```

## What changed vs v2

| Aspect | v2 | v3 |
|---|---|---|
| Services import `better-sqlite3` | ✅ yes | ❌ no |
| SQL strings in `services/` | Yes | **Zero** |
| Test service without DB | Impossible | Trivial — pass a fake repo |
| Swap SQLite → Postgres | Rewrite services | Write `PostgresBookRepository`, wire in `index.ts` |
| New file count | 4 | 8 |

## New files

- `domain/Book.ts`, `domain/Order.ts` — entities.
- `domain/errors.ts` — domain-owned exceptions.
- `domain/ports/BookRepository.ts`, `OrderRepository.ts` — the **interfaces** services depend on.
- `infrastructure/persistence/SqliteBookRepository.ts`, `SqliteOrderRepository.ts` — implementations.

## What got better

- **Grep test:** `grep -r "SELECT\|INSERT\|UPDATE" src/services` → zero hits. Services are now DB-agnostic.
- **Fake substitution:** an `InMemoryBookRepository` in tests replaces SQLite in 5 lines.
- **Named methods:** `countByCustomer` instead of a hand-rolled SQL count in the service.
- **Domain entities are pure TypeScript** — no `better-sqlite3` type leakage.

## What's still off (motivates v4)

- Folder shape: `services/` sits at `src/` root — layer intent isn't obvious.
- No hard rule that domain files can't accidentally import Express.
- `main.ts` responsibilities (wiring, schema, seeding) all still in `index.ts` next to routes.

## AI prompt to arrive at v4

See "Step 3 → 4" in [../README.md](../README.md#the-ai-prompts-in-order).

Next: [../v4-clean-architecture/](../v4-clean-architecture/).

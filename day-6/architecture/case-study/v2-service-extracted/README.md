# v2 — Service Extracted

**Business rules move out of routes into `services/`. Controllers become thin.**

## Run

```powershell
npm install
npm run dev
```

## What changed vs v1

| Aspect | v1 | v2 |
|---|---|---|
| Files | 1 (`index.ts`) | 4 (`index.ts`, 2 services, `errors.ts`) |
| Where's the loyalty rule? | Buried in `/orders` handler | `OrderService.place` |
| Route length | ~15 lines each | ~4 lines each |
| Adding "VIP discount" | Edit route, risk breaking other paths | Edit `OrderService.place` only |
| Error handling | Scattered `res.status` | One error middleware translates typed errors |

## What got *better*

1. **Locatability** — search for `place(` and you find the whole business rule.
2. **Consistency** — every error becomes an HTTP response in *one* middleware.
3. **Testability** — you can `new OrderService(db)` from a test (still needs DB, fixed in v3).
4. **Naming** — methods are business verbs (`place`, `addBook`, `list`).

## What is still bad (motivates v3)

- Services **still know SQL**. Line 20 of `OrderService.ts`: `SELECT * FROM books …`.
- Services **cannot be tested without a database**.
- Swapping SQLite → Postgres = editing every service.

## AI prompt to arrive at v3

See the "Step 2 → 3" prompt in [../README.md](../README.md#the-ai-prompts-in-order).

Next: [../v3-repository-pattern/](../v3-repository-pattern/).

# v1 — Messy Monolith (the "before")

**One file. Everything mixed. This is the enemy.**

## Run it

```powershell
npm install
npm run dev
```

Then:

```powershell
curl http://localhost:3000/books
curl -X POST http://localhost:3000/orders -H "Content-Type: application/json" -d '{"customerId":1,"bookId":1}'
```

## What's in one file

- Express setup
- SQLite connection + schema + seed data
- Validation
- SQL queries
- Business rule (loyalty discount at 3+ orders)
- HTTP response formatting
- Error handling

## Smells (you should feel these)

| # | Smell | Line(s) |
|---|---|---|
| 1 | SQL literals in HTTP handler | ~50, ~65, ~72 |
| 2 | Business rule (`previous >= 3`) buried mid-handler | ~68 |
| 3 | Validation copy-pasted per route | ~40, ~60 |
| 4 | HTTP status codes decide domain outcomes | everywhere |
| 5 | Impossible to test the rule without booting Express + SQLite | — |
| 6 | Types are `any` (`as any` in three places) | ~53, ~66 |
| 7 | Two routes both mutate `books.stock` — no single source of truth | ~74 |

## Try adding one feature — feel the pain

Add: *"Give a 20% VIP discount to customerId 42."*

Notice how you must:

1. Find the loyalty-discount code (grep for `discount`).
2. Insert another `if` next to it, competing with the existing rule.
3. Manually reason about interaction: does VIP stack with loyalty?
4. Test only by making an HTTP call. No unit test possible.

The next version fixes this.

## What comes next

Go to [../v2-service-extracted/](../v2-service-extracted/) — we pull rules out of routes into services.

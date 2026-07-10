# Exercise 3 — Build a Repository from Scratch

**After:** Module 4. **Time:** 60 minutes.

## Goal

Design a `Customer` aggregate with two independent repository implementations (SQLite + in-memory), then prove the service is DB-agnostic.

## Requirements

Business capabilities:

- Register a customer with `name` and `email`. Email must be unique.
- Look up a customer by `id`.
- Look up a customer by `email`.
- List customers who joined this month.

## Deliverables

Create files (fresh scratch project or extend v4):

```
src/
├── domain/
│   ├── Customer.ts            (interface Customer { id, name, email, joinedAt })
│   ├── errors.ts              (add DuplicateEmailError)
│   └── ports/
│       └── CustomerRepository.ts
├── application/
│   └── CustomerService.ts     (methods: register, findById, findByEmail, listRecent)
└── infrastructure/
    └── persistence/
        └── SqliteCustomerRepository.ts

tests/
├── fakes/
│   └── InMemoryCustomerRepository.ts
└── CustomerService.spec.ts
```

## The interface (design it BEFORE the impl)

Rules:

- Method names in **business language**, not SQL.
- Return domain `Customer` objects or `null`. No raw rows.
- Do not leak `Database.Database` types.

## Tests to write (before or after — pick one and be honest)

- `register` creates a customer.
- `register` throws `DuplicateEmailError` on collision (test with **the in-memory repo**).
- `findByEmail` returns `null` for unknown.
- `listRecent` returns only this-month joiners.

## Acceptance checklist

- [ ] `CustomerService` file imports **zero** libraries other than domain.
- [ ] The same service passes tests with either repo implementation (swap in `beforeEach`).
- [ ] SQLite repo has a `toDomain` mapper — no row leaks.
- [ ] Interface method names contain **zero** of: `select`, `insert`, `update`, `where`, `query`.
- [ ] `DuplicateEmailError` is thrown from the *service*, not the *repo*. (Why? Because "duplicate email" is a business rule — the repo just stores things.)

## Stretch

- Add a `deactivate(customerId)` method with a soft-delete pattern (`active: boolean`). Where does the boolean live — domain, or infra? Justify in one sentence.

## AI prompt to check your work

Use **Prompt 3** from [../prompts/README.md](../prompts/README.md). Paste the interface + SQLite impl.

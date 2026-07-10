# Exercise 4 — Wire Everything with DI

**After:** Module 6. **Time:** 45 minutes.

## Goal

Practice moving from manual DI to `tsyringe` — and then swap an implementation per environment.

## Setup

Start from your solution to Exercise 3 (the `CustomerService` + repositories). If you don't have it, use v4 case-study.

## Part A — Manual composition root (15 min)

Create a `src/main.ts` that:

1. Opens the SQLite database.
2. Instantiates `SqliteCustomerRepository`.
3. Instantiates `CustomerService`.
4. Exports a `buildApp()` factory that returns an Express app.

Constraints:

- **Only** `main.ts` may call `new` for infrastructure classes.
- No import of `Sqlite*` from anywhere in `application/` or `domain/`.

## Part B — Introduce `tsyringe` (20 min)

1. Add `tsyringe` + `reflect-metadata` to `package.json`.
2. Enable decorators in `tsconfig.json` (both `experimentalDecorators` and `emitDecoratorMetadata`).
3. Create `src/tokens.ts` with `CustomerRepository` token.
4. Annotate `CustomerService` and `SqliteCustomerRepository` with `@injectable()`.
5. In `main.ts`, register the token → class mapping and `container.resolve(CustomerService)`.
6. Add `import 'reflect-metadata';` at the very top of `main.ts`.

Confirm: the app still starts and responds identically.

## Part C — Swap for a fake in a test main (10 min)

Create `src/main.test.ts`:

- Uses `container.createChildContainer()`.
- Registers `InMemoryCustomerRepository` for `TOKENS.CustomerRepository`.
- Exports a `buildTestApp()` that returns a fully-wired Express app **with no database**.

Write **one** test that hits `POST /customers` on `buildTestApp()` and asserts 201.

## Acceptance checklist

- [ ] `grep -r "new Sqlite" src` → matches only in `main.ts`.
- [ ] `CustomerService` constructor uses `@inject(TOKENS.CustomerRepository)`.
- [ ] `main.test.ts` never touches disk.
- [ ] Prod and test wiring differ **only** in the `container.register` line(s).

## Reflection prompt

Write 3–5 sentences answering: *"For an app with 5 services and 5 repositories, would you use manual DI or `tsyringe`? Why?"* There is no wrong answer — argue it.

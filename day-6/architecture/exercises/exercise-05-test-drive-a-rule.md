# Exercise 5 — Test-Drive a New Rule

**After:** Module 7. **Time:** 60 minutes.

## Goal

Practice **test-first** development against a clean-architecture app. You will *only* write tests, then let them drive the implementation.

## Setup

Work in [../case-study/v6-ai-reviewed](../case-study/v6-ai-reviewed) (or a copy).

## The new rule

> **VIP Customers get a 20% discount on every order.**
> A VIP is any customer whose `customerId` appears in a new `vip_customers` table (columns: `customer_id INTEGER PRIMARY KEY`).
> The VIP discount **replaces** (does not stack with) the loyalty discount when applicable.

## Part A — Write the tests first (25 min)

Add to `tests/OrderService.spec.ts`:

1. `it('applies 20% VIP discount when customer is VIP')` — VIP, no prior orders.
2. `it('VIP discount takes precedence over loyalty discount')` — VIP with 5 prior orders → still 20%.
3. `it('non-VIP still gets loyalty discount')` — regression.
4. `it('non-VIP with no prior orders pays full price')` — regression.
5. `it('records discountApplied = true when any discount is used')`.

Constraint: use **an in-memory VIP repository** (a new fake). Do not touch SQLite in unit tests.

## Part B — Introduce the port (5 min)

Create `src/domain/ports/VipRepository.ts`:

```ts
export interface VipRepository {
  isVip(customerId: number): boolean;
}
```

Create `tests/fakes/InMemoryVipRepository.ts` that lets tests seed VIPs.

## Part C — Make tests pass (20 min)

1. Modify `OrderService` constructor to accept a `VipRepository`.
2. Update `place()` — the decide step now considers VIP first, then loyalty.
3. Update every test's `beforeEach` to pass the fake.

Do **not** touch infrastructure or presentation yet.

## Part D — Wire the real thing (10 min)

1. Create `src/infrastructure/persistence/SqliteVipRepository.ts` + `vip_customers` table in `db.ts`.
2. Register in `main.ts` with a new token.
3. Add one integration test round-tripping a VIP row.

## Acceptance checklist

- [ ] All 5 new unit tests were **red before green**.
- [ ] Unit tests run in < 100 ms total.
- [ ] `SqliteVipRepository` has ≥ 1 integration test.
- [ ] `npm run arch:check` still passes (no layer violations).
- [ ] `OrderService.place` still fits **load → decide → persist**.

## Reflection

Which of these felt easier than in v1? Which felt harder? Would you make the discount strategy pluggable (a `DiscountPolicy` port) if a *third* discount rule appeared? Justify.

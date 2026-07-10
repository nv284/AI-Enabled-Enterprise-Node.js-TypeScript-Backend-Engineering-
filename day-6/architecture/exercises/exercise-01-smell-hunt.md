# Exercise 1 — Smell Hunt

**After:** Module 2. **Time:** 30 minutes. **Solo or pair.**

## Goal

Practice spotting architectural smells *before* you know the patterns to fix them. This trains the "gut" that Modules 3–7 give the language for.

## Task

Open [../case-study/v1-messy-monolith/src/index.ts](../case-study/v1-messy-monolith/src/index.ts).

Do **not** look at v2–v6 yet.

Produce a file `exercise-01-answers.md` with:

### Part A — Smell census (15 min)

For each smell in the table below, either **quote the offending line(s)** or write "not present".

| # | Smell | Where? |
|---|---|---|
| 1 | HTTP status code decides domain outcome | |
| 2 | SQL literal inside a request handler | |
| 3 | Business rule (comparison / threshold) buried inside a handler | |
| 4 | Repeated validation logic across handlers | |
| 5 | `any` cast used to escape type checking | |
| 6 | State mutation (e.g. stock decrement) not encapsulated | |
| 7 | Config / seed data intermixed with routes | |
| 8 | Impossible to test without booting Express + SQLite | |

### Part B — Change-cost estimate (10 min)

For **each** of the following requirements, rate difficulty **Low / Medium / High** and write one sentence explaining why:

1. "Ship a CLI tool that also places orders (same rules)."
2. "Charge tax = 5% on the total."
3. "Persist to PostgreSQL instead of SQLite."
4. "Send an email confirming each order."
5. "Add a unit test for the loyalty rule."

### Part C — Predict the future (5 min)

Save this answer:

> *If we keep adding features in this style, in three months this file will be… (X lines / Y routes / how painful?)*

Return to this in Week 2 after the capstone. See if you were right.

## Grading (self)

- **≥ 6** correctly-identified smells in Part A → you're ready for Module 3.
- **< 6** → re-read Module 2, then try again with a friend.

# Clean Architecture for Node.js + TypeScript — Fresher Training Program

A hands-on, project-based training program that takes an absolute beginner from *"I can write an Express route"* to *"I can design, review, and defend a layered architecture — with an AI copilot"*.

**Audience:** Freshers / junior developers with basic JavaScript & Node.js familiarity.
**Duration:** ~5 days of guided learning + 1 capstone week.
**Stack:** Node.js 20+, TypeScript 5+, Express, Vitest, SQLite (via `better-sqlite3`), `tsyringe`, `madge`, `dependency-cruiser`.

---

## Learning outcomes

By the end, a participant can:

1. Explain **why** architecture matters (change cost, testability, onboarding).
2. Refactor a messy Express app into **Clean Architecture** layers.
3. Apply the **Repository Pattern** to isolate persistence.
4. Design a **Service Layer** that owns business rules.
5. Use **Dependency Injection** to invert control.
6. Write **unit tests** against services using in-memory repos.
7. Use **AI + tools** (`madge`, `dependency-cruiser`, prompts) to review architecture, spot layer violations, and detect circular dependencies.

---

## How this repo is organized

| Folder | Purpose |
|---|---|
| [SETUP.md](SETUP.md) | Prerequisites, tooling, environment setup |
| [modules/](modules/) | 9 concept modules (read + do) |
| [case-study/](case-study/) | The **Bookstore API** — refactored across 6 versions (v1 messy → v6 clean + AI-reviewed) |
| [exercises/](exercises/) | Standalone drills that reinforce each module |
| [capstone/](capstone/) | Final project brief + evaluation rubric |
| [prompts/](prompts/) | Reusable AI prompts you can copy-paste |

---

## The 9 modules

| # | Module | What you'll build |
|---|---|---|
| 1 | [Introduction to software architecture](modules/01-introduction-to-architecture.md) | Mental models, cost-of-change curve |
| 2 | [Traditional vs Clean — a side-by-side](modules/02-traditional-vs-clean.md) | Read two versions of the same feature |
| 3 | [Clean Architecture fundamentals](modules/03-clean-architecture-fundamentals.md) | Layers, dependency rule, ports & adapters |
| 4 | [The Repository Pattern](modules/04-repository-pattern.md) | Swap SQLite ↔ in-memory ↔ Postgres without touching business code |
| 5 | [The Service Layer](modules/05-service-layer.md) | Business rules that don't know what a `Request` is |
| 6 | [Dependency Injection in TypeScript](modules/06-dependency-injection.md) | Composition root, `tsyringe`, manual DI |
| 7 | [Testing a layered app](modules/07-testing-strategies.md) | Fast unit tests, focused integration tests |
| 8 | [AI-assisted architecture review](modules/08-ai-assisted-architecture-review.md) | Prompt patterns that find real issues |
| 9 | [Dependency analysis with AI + tools](modules/09-dependency-analysis-with-ai.md) | `madge`, `dependency-cruiser`, layer rules |

---

## The case study — Bookstore API

We build **one project** across all modules so improvements compound:

- **v1** — `case-study/v1-messy-monolith` — one 300-line Express file, SQL in the route, business rules mixed with HTTP.
- **v2** — `case-study/v2-service-extracted` — pull business rules into a service.
- **v3** — `case-study/v3-repository-pattern` — hide SQL behind a repository interface.
- **v4** — `case-study/v4-clean-architecture` — four proper layers with the dependency rule.
- **v5** — `case-study/v5-dependency-injection` — invert construction with `tsyringe`.
- **v6** — `case-study/v6-ai-reviewed` — after tests, `madge`, and an AI review pass.

Each version has its own `README.md` explaining **what changed, why, and what got better**.

See [case-study/README.md](case-study/README.md) for the full walkthrough with **copy-pasteable AI prompts for every step**.

---

## Recommended schedule

| Day | Morning | Afternoon |
|---|---|---|
| **1** | Module 1 + 2 (concepts) | Case study v1 walkthrough + Exercise 1 |
| **2** | Module 3 | Case study v2 + v3 + Exercise 2 |
| **3** | Module 4 + 5 | Case study v4 + Exercise 3 |
| **4** | Module 6 + 7 | Case study v5 + write unit tests + Exercise 4 |
| **5** | Module 8 + 9 | Case study v6 (AI review) + Exercise 5 |
| **Week 2** | Capstone project | Peer review with AI + presentation |

---

## Before you start

1. Read [SETUP.md](SETUP.md) and get your environment working.
2. Read [modules/01-introduction-to-architecture.md](modules/01-introduction-to-architecture.md).
3. Open [case-study/README.md](case-study/README.md) in a side pane — you'll refer to it constantly.

Good luck. Architecture is a *muscle*, not a *fact* — you build it by refactoring.

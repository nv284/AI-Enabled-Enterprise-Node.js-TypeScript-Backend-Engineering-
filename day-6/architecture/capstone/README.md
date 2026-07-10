# Capstone Project — "TaskFlow API"

Build a small task-management HTTP API using **everything** you learned. You will present the result and defend the architecture in a 10-minute review.

**Duration:** 1 week (part-time) or 3 focused days.
**Stack:** Node.js 20+, TypeScript 5+, Express, Vitest, SQLite.
**Grading:** see [RUBRIC.md](RUBRIC.md).

---

## 1. Domain

**TaskFlow** helps a small team manage tasks in shared projects.

### Entities

- `User`         — `id`, `name`, `email` (unique).
- `Project`      — `id`, `name`, `ownerId`.
- `Task`         — `id`, `projectId`, `title`, `assigneeId | null`, `status` (`todo` | `in_progress` | `done`), `dueDate | null`, `createdAt`.
- `Comment`      — `id`, `taskId`, `authorId`, `body`, `createdAt`.

### Business rules (must be enforced in services)

1. A project can only be created by an existing user (its owner).
2. Only members of a project may create tasks in it. (Membership = `owner` + anyone assigned to at least one task in that project.)
3. A task's `assigneeId` must be a user who is a member of the project.
4. Status transitions: `todo → in_progress → done`. `done → in_progress` is allowed. Backward jump to `todo` is **forbidden**.
5. `dueDate` (if set) must be in the future at creation time.
6. Comments can only be added to tasks the commenter is a member of the project of.
7. Deleting a project cascades to its tasks and comments (transaction).

---

## 2. HTTP surface (minimum)

| Verb + path | Purpose | Success | Common errors |
|---|---|---|---|
| `POST /users` | Register user | 201 | 400 duplicate email |
| `POST /projects` | Create project | 201 | 400 unknown owner |
| `POST /projects/:id/tasks` | Create task | 201 | 403 non-member, 400 bad assignee, 400 past due date |
| `PATCH /tasks/:id/status` | Change status | 200 | 409 illegal transition |
| `POST /tasks/:id/comments` | Add comment | 201 | 403 non-member |
| `GET /projects/:id` | Project detail with tasks | 200 | 404 |
| `GET /tasks/:id` | Task detail with comments | 200 | 404 |
| `DELETE /projects/:id` | Cascading delete | 204 | 403 non-owner |
| `GET /health` | Liveness | 200 | — |

Use JSON bodies. Use HTTP status codes properly (400 validation, 403 policy, 404 not-found, 409 conflict).

---

## 3. Non-negotiables

Your final submission must have **all** of:

1. **Four layers** matching the [Clean Architecture](../modules/03-clean-architecture-fundamentals.md) folder shape.
2. A **repository interface** for every persistent aggregate (User, Project, Task, Comment).
3. A **service class** per aggregate, with methods named in business language.
4. **Zero SQL** inside `src/application/` (verify with grep).
5. **Zero `express` imports** inside `src/domain/` or `src/application/`.
6. A **composition root** (`main.ts`) — the only place `new Sqlite*Repository` appears.
7. **Vitest unit tests** for every service method (happy + at least one unhappy path).
8. **≥ 1 integration test per repository** using `:memory:` SQLite.
9. **≥ 3 E2E tests** covering the golden path of the three most important routes.
10. A **`.dependency-cruiser.js`** config enforcing the layer rules; `npm run arch:check` must exit 0.
11. `madge --circular` returns no cycles.
12. A **README** with: how to run, how to test, the 4-layer diagram (Mermaid), and a "design decisions" section.
13. A **`docs/ai-review.md`** capturing at least one AI review pass using [Prompt 1 or 2](../prompts/README.md), with your notes on which findings you accepted and why.

---

## 4. Suggested schedule

| Day | Do |
|---|---|
| 1 | Draft the domain model on paper. Write the 4 entity files. Write the 4 repository interfaces. Set up TS + Vitest + tsyringe. |
| 2 | Write **failing** tests for `UserService.register`, `ProjectService.create`, `TaskService.create`. Implement to green. |
| 3 | Add `TaskService.changeStatus` with the transition rule. Add `CommentService.add` with membership rule. Full test coverage. |
| 4 | Implement all SQLite repositories. Integration tests against `:memory:`. Wire everything in `main.ts`. Write controllers. |
| 5 | E2E tests. Cascading delete transaction. Add `dependency-cruiser` config and CI workflow. AI review pass. Polish README + diagram. |

---

## 5. AI usage (encouraged, tracked)

You **should** use AI. In `docs/ai-usage.md`, list:

- Every non-trivial prompt you used (paste them).
- What you accepted, what you rejected, what was hallucinated.
- One thing you learned from an AI response.

This is not a gotcha — the goal is to show you can *direct* an AI, not be steered by it.

---

## 6. Presentation (10 min + 5 min Q&A)

Prepare 4 slides / talking points:

1. **The domain** — one Mermaid class diagram.
2. **The dependency picture** — screenshot from `npm run arch:graph`.
3. **A test at each layer** — one unit, one integration, one E2E (show and explain).
4. **A trade-off you made** — one design decision that could have gone another way, and why you chose this side.

Bring the repo. Reviewers will run `npm test` and `npm run arch:check` live.

---

## 7. Deliverables checklist (paste in your PR description)

- [ ] `README.md` with run/test/diagram/decisions
- [ ] All 12 non-negotiables met
- [ ] `npm test` green
- [ ] `npm run arch:cycles` green
- [ ] `npm run arch:check` green
- [ ] `docs/ai-review.md` present
- [ ] `docs/ai-usage.md` present
- [ ] 10-min presentation ready

Good luck. Judge yourself against [RUBRIC.md](RUBRIC.md) before submitting.

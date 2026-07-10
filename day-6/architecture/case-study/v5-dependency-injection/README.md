# v5 — Dependency Injection with `tsyringe`

**Same architecture as v4. The wiring becomes declarative and per-environment configs get cheap.**

## Run

```powershell
npm install
npm run dev
```

## What changed vs v4

| Aspect | v4 | v5 |
|---|---|---|
| Wiring style | Manual (`new X(y, z)` for each service) | Declarative (`container.register(...)`) |
| Services get their deps by | Constructor parameters written in `main.ts` | `@inject(TOKENS.X)` decorators |
| Adding a service that needs a repo | Edit `main.ts` to pass repo in | Add `@inject`, resolve — done |
| Swapping impl per env (test/prod) | Two branches in `main.ts` | Two `container.register()` calls |
| Extra machinery | None | `tsyringe`, `reflect-metadata`, decorators |
| `main.ts` size | ~30 lines | ~25 lines (stays flat as app grows) |

## New files / concepts

- `src/tokens.ts` — one place for injection tokens.
- `@injectable()` on every constructable class.
- `@inject(TOKENS.X)` on constructor parameters that are interfaces.
- `import 'reflect-metadata'` at the very top of `main.ts` (required by `tsyringe`).

## What got better

1. **Room to grow** — 3 services or 50, `main.ts` stays roughly the same size.
2. **Per-environment configs** — a `main.test.ts` could swap in `InMemoryBookRepository` in three lines.
3. **Explicit dependency graph** — `TOKENS` gives you autocompleted, spell-checked keys.

## What got a bit worse

- More concepts for a fresher (decorators, tokens, reflect-metadata).
- Slight compile-time cost from decorator emit.
- Errors from the container can be terser than a plain TS mismatch.

> **Guidance:** for apps under ~30 classes, v4-style manual wiring is often clearer. v5 shows the *shape* you'll grow into.

## What's still off (motivates v6)

- Zero tests still.
- No automated architecture enforcement.
- Nothing stops a new dev from importing SQLite into a service file.

## AI prompt to arrive at v6

See "Step 5 → 6" in [../README.md](../README.md#the-ai-prompts-in-order).

Next: [../v6-ai-reviewed/](../v6-ai-reviewed/).

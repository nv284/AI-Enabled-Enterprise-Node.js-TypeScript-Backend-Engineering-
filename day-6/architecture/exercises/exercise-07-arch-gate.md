# Exercise 7 — Enforce Architecture in CI

**After:** Module 9. **Time:** 45 minutes.

## Goal

Wire `madge`, `dependency-cruiser`, and Vitest into a pre-commit hook and a GitHub Actions workflow so architecture violations **cannot be merged**.

## Setup

Work in a fork/copy of the [v6 case study](../case-study/v6-ai-reviewed).

## Part A — Local pre-commit gate (20 min)

1. `npm install --save-dev husky lint-staged`.
2. Initialize husky: `npx husky init`.
3. In `.husky/pre-commit`:

   ```sh
   npm run arch:cycles
   npm run arch:check
   npx lint-staged
   ```

4. Add `lint-staged` config to `package.json`:

   ```json
   "lint-staged": {
     "src/**/*.ts": ["npx tsc --noEmit"]
   }
   ```

5. Verify: staging any `.ts` change and running `git commit` should trigger the checks.

## Part B — CI gate (15 min)

Create `.github/workflows/architecture.yml`:

```yaml
name: architecture
on: [pull_request, push]
jobs:
  arch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run arch:cycles
      - run: npm run arch:check
      - run: npm test -- --run
```

Push and confirm the check appears green on a PR.

## Part C — Prove the gate works (10 min)

On a scratch branch, deliberately break each rule *one at a time* and confirm the gate fails with the correct rule name. Then revert.

1. Add `import 'better-sqlite3'` to `src/domain/Book.ts` → expect `domain-is-pure`.
2. Add `import '../infrastructure/persistence/SqliteBookRepository'` to `src/application/OrderService.ts` → expect `application-only-uses-domain`.
3. Introduce a cycle: make two application files import each other → expect `no-circular`.

## Acceptance checklist

- [ ] `git commit` fails locally on any of the 3 violations.
- [ ] The GitHub Actions run fails on those same violations.
- [ ] `npm run arch:graph` produces a dependency graph you can screenshot.
- [ ] All violations named in the CI output match rule names in `.dependency-cruiser.js`.

## Reflection

Write 3–5 sentences:

- What's now impossible in this repo that was easy before?
- Is there a rule you'd **remove** because it's too strict? Which and why?
- Is there a rule you'd **add** for a real production app? Which and why?

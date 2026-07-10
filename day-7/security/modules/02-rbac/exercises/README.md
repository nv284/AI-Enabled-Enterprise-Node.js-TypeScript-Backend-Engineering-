# Module 2 — Exercises

## Ex 1 — Add an admin listing (15 min)

Extend `examples/01-rbac-middleware.ts`:

- Add `GET /admin/users` returning a hard-coded array.
- Protect it with `requireRole('admin')`.
- Verify: with Ada's token → 403; with Carol's token → 200.

## Ex 2 — Fix the BOLA (20 min)

Look at `starter/notes.ts`. `GET /notes/:id` returns any note. Add:

1. Authentication.
2. Ownership check (or admin bypass).
3. Return **404** instead of 403 for non-owned/non-existent resources.

Then write two `curl` calls that prove Ada cannot fetch Bob's note.

## Ex 3 — Fix mass assignment (20 min)

The starter `starter/profile.ts` has a `PATCH /me` that merges `req.body` directly.

1. Define a strict Zod schema listing exactly the editable fields (`name`, `email`).
2. On failure return `400` with a helpful (but not overly verbose) error.
3. Verify: sending `{ "role": "admin" }` returns `400` and does not change the role.

## Ex 4 (stretch) — Permission table (25 min)

Replace role checks with a permission table:

```ts
const rolePermissions = {
  admin: ['*'],
  user:  ['note:read:own', 'note:create', 'note:update:own', 'note:delete:own'],
};
```

Implement `requirePermission(perm)` middleware. Update all handlers to use it. Bonus: introduce a new role `viewer` that can only read.

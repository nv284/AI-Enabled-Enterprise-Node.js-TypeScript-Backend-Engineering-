# Solutions — Module 2

## Ex 2 — Fix BOLA

```ts
app.get('/notes/:id', authGuard, (req: AuthedRequest, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'not found' });
  const isOwner = note.userId === req.user!.sub;
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(404).json({ error: 'not found' });
  res.json(note);
});
```

**Proof** (with Ada's token):
```
curl http://localhost:3012/notes/1 -H "Authorization: Bearer <ada>"  # 200
curl http://localhost:3012/notes/2 -H "Authorization: Bearer <ada>"  # 404
```

## Ex 3 — Fix mass assignment

```ts
import { z } from 'zod';

const UpdateMeSchema = z.object({
  name:  z.string().min(1).max(80).optional(),
  email: z.string().email().optional(),
}).strict();

app.patch('/me', (req, res) => {
  const parsed = UpdateMeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid body' });
  Object.assign(me, parsed.data);
  res.json(me);
});
```

Sending `{ "role": "admin" }` → 400 (unknown key). Never trust field names from the client.

## Ex 4 — Permission table

```ts
const rolePermissions: Record<string, string[]> = {
  admin:  ['*'],
  user:   ['note:read:own', 'note:create', 'note:update:own', 'note:delete:own'],
  viewer: ['note:read:own'],
};

const requirePermission = (perm: string) =>
  (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    const perms = rolePermissions[req.user.role] ?? [];
    if (perms.includes('*') || perms.includes(perm)) return next();
    return res.status(403).json({ error: 'forbidden' });
  };

app.get('/notes', authGuard, requirePermission('note:read:own'), ...);
```

`:own` suffix still needs an ownership check inside the handler — the middleware only checks the class of permission, not per-record ownership.

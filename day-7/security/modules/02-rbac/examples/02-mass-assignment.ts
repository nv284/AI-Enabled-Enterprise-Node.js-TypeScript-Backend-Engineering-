/**
 * Example — mass assignment.
 *
 * Vulnerable handler: PATCH /me merges the raw request body into the DB record.
 * A user sends { role: "admin" } and gets promoted.
 *
 * Safe handler: validate + whitelist via Zod.
 *
 * Run: npx tsx 02-mass-assignment.ts
 */
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

type User = { id: string; name: string; email: string; role: 'user' | 'admin' };
const db: Record<string, User> = {
  ada: { id: 'ada', name: 'Ada', email: 'ada@x.com', role: 'user' },
};

/* ---------- vulnerable ---------- */
app.patch('/vuln/me', (req, res) => {
  const me = db.ada;
  Object.assign(me, req.body);         // ❌ trusts ALL keys, including "role"
  res.json(me);
});

/* ---------- safe: whitelist via schema ---------- */
const UpdateMeSchema = z.object({
  name:  z.string().min(1).max(80).optional(),
  email: z.string().email().optional(),
}).strict();                            // .strict() rejects unknown keys

app.patch('/safe/me', (req, res) => {
  const parsed = UpdateMeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  Object.assign(db.ada, parsed.data);   // only known, validated fields
  res.json(db.ada);
});

console.log('Try:');
console.log('  curl -X PATCH http://localhost:3011/vuln/me -H "content-type: application/json" -d "{\\"name\\":\\"A\\",\\"role\\":\\"admin\\"}"');
console.log('  curl -X PATCH http://localhost:3011/safe/me -H "content-type: application/json" -d "{\\"name\\":\\"A\\",\\"role\\":\\"admin\\"}"');
app.listen(3011);

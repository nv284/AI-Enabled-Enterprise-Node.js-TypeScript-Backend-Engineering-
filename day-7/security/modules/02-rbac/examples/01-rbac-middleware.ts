/**
 * Example — RBAC middleware with per-record ownership.
 *
 * Users:
 *   - ada (role: user)   token below
 *   - bob (role: user)
 *   - carol (role: admin)
 *
 * Run: npx tsx 01-rbac-middleware.ts
 * The console prints ready-to-use test tokens.
 */
import express, { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET = 'training-secret';
const app = express();
app.use(express.json());

/* ---------- fake DB ---------- */
type Note = { id: string; userId: string; title: string; body: string };
const notes: Note[] = [
  { id: '1', userId: 'ada',  title: 'Ada shopping', body: 'milk, bread' },
  { id: '2', userId: 'bob',  title: "Bob's secrets", body: 'redacted' },
];

/* ---------- auth ---------- */
interface AuthedRequest extends Request {
  user?: { sub: string; role: 'user' | 'admin' };
}

function authGuard(req: AuthedRequest, res: Response, next: NextFunction) {
  const [scheme, token] = (req.header('authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const c = jwt.verify(token, SECRET, { algorithms: ['HS256'] }) as JwtPayload;
    req.user = { sub: String(c.sub), role: c.role as 'user' | 'admin' };
    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

const requireRole = (...allowed: string[]) => (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
  next();
};

/* ---------- routes ---------- */

// Users see only their own notes; admin sees all.
app.get('/notes', authGuard, (req: AuthedRequest, res) => {
  const visible = req.user!.role === 'admin' ? notes : notes.filter(n => n.userId === req.user!.sub);
  res.json(visible);
});

// BOLA-safe fetch: 404 if not owner and not admin.
app.get('/notes/:id', authGuard, (req: AuthedRequest, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'not found' });
  const isOwner = note.userId === req.user!.sub;
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(404).json({ error: 'not found' });
  res.json(note);
});

// Admin-only listing of all users' notes.
app.get('/admin/notes', authGuard, requireRole('admin'), (_req, res) => res.json(notes));

/* ---------- issue demo tokens ---------- */
function mint(sub: string, role: 'user' | 'admin') {
  return jwt.sign({ sub, role }, SECRET, { algorithm: 'HS256', expiresIn: '1h' });
}
console.log('\nTest tokens (Authorization: Bearer <token>):');
console.log('  ada  :', mint('ada', 'user'));
console.log('  bob  :', mint('bob', 'user'));
console.log('  carol:', mint('carol', 'admin'));

app.listen(3010, () => console.log('\nhttp://localhost:3010'));

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { AppError } from '../errors.js';
import { authGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';

export const notesRouter = Router();

const CreateNote = z
  .object({
    title: z.string().min(1).max(200),
    body: z.string().max(10_000).default(''),
  })
  .strict();

const UpdateNote = z
  .object({
    title: z.string().min(1).max(200).optional(),
    body: z.string().max(10_000).optional(),
  })
  .strict();

const ListQuery = z
  .object({
    all: z.enum(['true', 'false']).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    cursor: z.string().uuid().optional(),
  })
  .strict();

notesRouter.use(authGuard);

notesRouter.get('/', validate(ListQuery, 'query'), async (req, res, next) => {
  try {
    const q = req.query as unknown as z.infer<typeof ListQuery>;
    const isAdmin = req.user!.role === 'admin';
    const wantsAll = isAdmin && q.all === 'true';

    const notes = await prisma.note.findMany({
      where: wantsAll ? undefined : { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: q.limit,
      ...(q.cursor ? { skip: 1, cursor: { id: q.cursor } } : {}),
    });
    res.json({ items: notes, nextCursor: notes.length === q.limit ? notes[notes.length - 1].id : null });
  } catch (e) {
    next(e);
  }
});

notesRouter.post('/', validate(CreateNote), async (req, res, next) => {
  try {
    const { title, body } = req.body as z.infer<typeof CreateNote>;
    const note = await prisma.note.create({
      data: { userId: req.user!.sub, title, body },
    });
    res.status(201).json(note);
  } catch (e) {
    next(e);
  }
});

// BOLA-safe: 404 whether the note doesn't exist OR isn't yours.
async function getOwnedOr404(id: string, userId: string, role: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) return null;
  if (note.userId !== userId && role !== 'admin') return null;
  return note;
}

notesRouter.get('/:id', async (req, res, next) => {
  try {
    const note = await getOwnedOr404(req.params.id, req.user!.sub, req.user!.role);
    if (!note) throw new AppError('not_found', 404);
    res.json(note);
  } catch (e) {
    next(e);
  }
});

notesRouter.patch('/:id', validate(UpdateNote), async (req, res, next) => {
  try {
    const owned = await getOwnedOr404(req.params.id, req.user!.sub, req.user!.role);
    if (!owned) throw new AppError('not_found', 404);
    const updated = await prisma.note.update({
      where: { id: owned.id },
      data: req.body as z.infer<typeof UpdateNote>,
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

notesRouter.delete('/:id', async (req, res, next) => {
  try {
    const owned = await getOwnedOr404(req.params.id, req.user!.sub, req.user!.role);
    if (!owned) throw new AppError('not_found', 404);
    await prisma.note.delete({ where: { id: owned.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

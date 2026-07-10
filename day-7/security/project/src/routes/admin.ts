import { Router } from 'express';
import { prisma } from '../db.js';
import { authGuard } from '../middleware/authGuard.js';
import { requireRole } from '../middleware/requireRole.js';

export const adminRouter = Router();

adminRouter.use(authGuard, requireRole('admin'));

adminRouter.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [users, notes] = await Promise.all([prisma.user.count(), prisma.note.count()]);
    res.json({ users, notes });
  } catch (e) {
    next(e);
  }
});

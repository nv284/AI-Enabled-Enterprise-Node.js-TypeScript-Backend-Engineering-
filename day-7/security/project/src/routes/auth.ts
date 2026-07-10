import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { AppError } from '../errors.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { hashPassword, verifyPassword } from '../services/password.js';
import {
  issueAccessToken,
  issueRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../services/tokens.js';

export const authRouter = Router();

const RegisterBody = z
  .object({
    email: z.string().email().max(254),
    password: z.string().min(12).max(200),
    name: z.string().min(1).max(80).optional(),
  })
  .strict();

const LoginBody = z
  .object({
    email: z.string().email().max(254),
    password: z.string().min(1).max(200),
  })
  .strict();

const RefreshBody = z
  .object({
    refreshToken: z.string().min(1).max(500),
  })
  .strict();

authRouter.post('/register', authLimiter, validate(RegisterBody), async (req, res, next) => {
  try {
    const { email, password, name } = req.body as z.infer<typeof RegisterBody>;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('email_taken', 409);

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name ?? null, role: 'user' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
});

authRouter.post('/login', authLimiter, validate(LoginBody), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof LoginBody>;
    const user = await prisma.user.findUnique({ where: { email } });
    const ok = await verifyPassword(password, user?.passwordHash);
    if (!user || !ok) throw new AppError('invalid_credentials', 401);

    const accessToken = issueAccessToken(user.id, user.role);
    const { raw: refreshToken } = await issueRefreshToken(user.id);
    res.json({ accessToken, refreshToken });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/refresh', authLimiter, validate(RefreshBody), async (req, res, next) => {
  try {
    const { refreshToken } = req.body as z.infer<typeof RefreshBody>;
    const result = await rotateRefreshToken(refreshToken);
    if ('error' in result) throw new AppError('invalid_token', 401);

    const user = await prisma.user.findUnique({ where: { id: result.userId } });
    if (!user) throw new AppError('invalid_token', 401);

    const accessToken = issueAccessToken(user.id, user.role);
    const { raw: newRefresh } = await issueRefreshToken(user.id, result.familyId);
    res.json({ accessToken, refreshToken: newRefresh });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/logout', validate(RefreshBody), async (req, res, next) => {
  try {
    const { refreshToken } = req.body as z.infer<typeof RefreshBody>;
    await revokeRefreshToken(refreshToken);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

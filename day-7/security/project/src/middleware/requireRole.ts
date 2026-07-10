import { RequestHandler } from 'express';
import { AppError } from '../errors.js';

export const requireRole =
  (...allowed: string[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(new AppError('unauthorized', 401));
    if (!allowed.includes(req.user.role)) return next(new AppError('forbidden', 403));
    next();
  };

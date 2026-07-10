import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';
import { AppError } from '../errors.js';

export const validate =
  (schema: ZodTypeAny, target: 'body' | 'query' | 'params' = 'body'): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse((req as unknown as Record<string, unknown>)[target]);
    if (!parsed.success) return next(new AppError('invalid_body', 400));
    (req as unknown as Record<string, unknown>)[target] = parsed.data;
    next();
  };

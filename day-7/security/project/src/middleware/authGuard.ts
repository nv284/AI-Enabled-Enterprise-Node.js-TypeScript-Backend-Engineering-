import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../errors.js';

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (!token || scheme?.toLowerCase() !== 'bearer') {
    return next(new AppError('unauthorized', 401));
  }

  try {
    const claims = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      clockTolerance: 5,
    }) as JwtPayload;

    if (typeof claims.sub !== 'string' || typeof claims.role !== 'string') {
      return next(new AppError('unauthorized', 401));
    }
    req.user = { sub: claims.sub, role: claims.role };
    return next();
  } catch {
    return next(new AppError('unauthorized', 401));
  }
}

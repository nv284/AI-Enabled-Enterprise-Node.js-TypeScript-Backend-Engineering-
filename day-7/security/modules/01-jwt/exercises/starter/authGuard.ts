// Starter for Ex 2 — implement the TODOs.
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'change-me-please';

interface AuthedRequest extends Request {
  user?: { sub: string; role: string };
}

export function authGuard(req: AuthedRequest, res: Response, next: NextFunction) {
  // TODO 1: read Authorization header, split into scheme + token
  // TODO 2: reject if scheme !== 'Bearer' (case-insensitive) or no token
  // TODO 3: jwt.verify with algorithms: ['HS256'], issuer, audience
  // TODO 4: on success, set req.user and next(); on failure, 401 generic
}

const app = express();
app.get('/me', authGuard, (req: AuthedRequest, res: Response) => {
  res.json({ user: req.user });
});
app.listen(3003, () => console.log('http://localhost:3003'));

import { ErrorRequestHandler, RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from './logger.js';

export class AppError extends Error {
  status: number;
  code: string;
  expose: boolean;
  constructor(code: string, status = 400, expose = true) {
    super(code);
    this.code = code;
    this.status = status;
    this.expose = expose;
  }
}

export const correlationId: RequestHandler = (req, res, next) => {
  const id = String(req.headers['x-correlation-id'] ?? randomUUID());
  req.correlationId = id;
  res.setHeader('x-correlation-id', id);
  next();
};

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'not_found' });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = (err as AppError).status ?? 500;
  const code = status < 500 && (err as AppError).expose ? (err as AppError).code : 'internal_error';
  logger.error(
    {
      correlationId: req.correlationId,
      status,
      err: { message: err.message, name: err.name, stack: err.stack },
    },
    'request failed'
  );
  res.status(status).json({ error: code, correlationId: req.correlationId });
};

// Starter for Ex 4 — rewrite as a safe error handler.
import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // ❌ leaks stack, versions, file paths
  res.status(500).send(err.stack);
};

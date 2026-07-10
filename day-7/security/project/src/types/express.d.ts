// Augment Express types with our per-request additions.
import 'express';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      user?: { sub: string; role: string };
    }
  }
}

export {};

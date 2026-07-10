import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './logger.js';
import { correlationId, errorHandler, notFound } from './errors.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { authGuard } from './middleware/authGuard.js';
import { authRouter } from './routes/auth.js';
import { notesRouter } from './routes/notes.js';
import { adminRouter } from './routes/admin.js';
import { googleAuthRouter } from './routes/googleAuth.js';
import { prisma } from './db.js';

export function createApp() {
  const app = express();

  // Behind a reverse proxy in prod, so rate-limits and req.secure work.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins.length > 0 ? env.corsOrigins : false,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(correlationId);
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ correlationId: req.correlationId }),
      autoLogging: {
        ignore: (req) => req.url === '/health',
      },
    })
  );

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/auth', authRouter);
  if (env.googleEnabled) {
    app.use('/auth/google', googleAuthRouter);
  }

  app.use('/notes', apiLimiter, notesRouter);
  app.use('/admin', apiLimiter, adminRouter);

  // Convenience "me" endpoint.
  app.get('/me', authGuard, async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.sub },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

import express, { Request, Response } from 'express';
import { todosRouter } from './routes/todos';

const app = express();
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/todos', todosRouter);

// Simple 404
app.use((_req, res) => res.status(404).json({ error: 'not found' }));

// Export a plain http.Server so index.ts can call .close() for graceful shutdown.
import { createServer } from 'http';
export const server = createServer(app);

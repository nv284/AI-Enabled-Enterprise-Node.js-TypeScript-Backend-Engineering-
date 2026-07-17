import express, { Request, Response } from 'express';
import { add, multiply, divide } from './math';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const greeting = process.env.GREETING ?? 'Hello';

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: `${greeting}, world!`, version: process.env.APP_VERSION ?? 'dev' });
});

app.get('/add/:a/:b', (req: Request, res: Response) => {
  const a = Number(req.params.a);
  const b = Number(req.params.b);
  res.json({ op: 'add', a, b, result: add(a, b) });
});

app.get('/multiply/:a/:b', (req: Request, res: Response) => {
  const a = Number(req.params.a);
  const b = Number(req.params.b);
  res.json({ op: 'multiply', a, b, result: multiply(a, b) });
});

app.get('/divide/:a/:b', (req: Request, res: Response) => {
  const a = Number(req.params.a);
  const b = Number(req.params.b);
  try {
    res.json({ op: 'divide', a, b, result: divide(a, b) });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Only start the server when this file is run directly (not during tests).
if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`hello-api listening on http://localhost:${port}`);
  });
}

export { app };

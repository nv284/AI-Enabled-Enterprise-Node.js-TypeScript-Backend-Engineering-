// Thin controllers. They ONLY translate HTTP <-> service calls.
import express, { Request, Response, NextFunction } from 'express';
import Database from 'better-sqlite3';

import { CatalogService } from './services/CatalogService';
import { OrderService }   from './services/OrderService';
import {
  BookNotFoundError, OutOfStockError, OrderNotFoundError, ValidationError,
} from './errors';

const db = new Database('bookstore.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    total INTEGER NOT NULL
  );
`);

const count = (db.prepare('SELECT COUNT(*) AS c FROM books').get() as any).c;
if (count === 0) {
  const ins = db.prepare('INSERT INTO books (title, price, stock) VALUES (?, ?, ?)');
  ins.run('Clean Code', 500, 5);
  ins.run('The Pragmatic Programmer', 800, 3);
  ins.run('Refactoring', 900, 2);
}

const catalog = new CatalogService(db);
const orders  = new OrderService(db);

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/books', (_req, res) => res.json(catalog.list()));

app.post('/books', (req, res, next) => {
  try   { res.status(201).json(catalog.addBook(req.body)); }
  catch (e) { next(e); }
});

app.post('/orders', (req, res, next) => {
  try {
    const { customerId, bookId } = req.body ?? {};
    if (typeof customerId !== 'number' || typeof bookId !== 'number') {
      throw new ValidationError('customerId and bookId required (numbers)');
    }
    res.status(201).json(orders.place(customerId, bookId));
  } catch (e) { next(e); }
});

app.get('/orders/:id', (req, res, next) => {
  try { res.json(orders.findById(Number(req.params.id))); }
  catch (e) { next(e); }
});

// Central error → HTTP translator. Every domain error type maps here in one place.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError)     return res.status(400).json({ error: err.message });
  if (err instanceof BookNotFoundError)   return res.status(404).json({ error: err.message });
  if (err instanceof OrderNotFoundError)  return res.status(404).json({ error: err.message });
  if (err instanceof OutOfStockError)     return res.status(409).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

app.listen(3000, () => console.log('v2 service-extracted running on :3000'));

import express, { Request, Response, NextFunction } from 'express';
import Database from 'better-sqlite3';

import { SqliteBookRepository }  from './infrastructure/persistence/SqliteBookRepository';
import { SqliteOrderRepository } from './infrastructure/persistence/SqliteOrderRepository';
import { CatalogService } from './services/CatalogService';
import { OrderService }   from './services/OrderService';
import {
  BookNotFoundError, OutOfStockError, OrderNotFoundError, ValidationError,
} from './domain/errors';

// --- infrastructure ---
const db = new Database('bookstore.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, price INTEGER NOT NULL, stock INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL, book_id INTEGER NOT NULL,
    total INTEGER NOT NULL, discount_applied INTEGER NOT NULL DEFAULT 0
  );
`);

// --- adapters ---
const bookRepo  = new SqliteBookRepository(db);
const orderRepo = new SqliteOrderRepository(db);

if (bookRepo.findAll().length === 0) {
  bookRepo.save({ title: 'Clean Code', price: 500, stock: 5 });
  bookRepo.save({ title: 'The Pragmatic Programmer', price: 800, stock: 3 });
  bookRepo.save({ title: 'Refactoring', price: 900, stock: 2 });
}

// --- services ---
const catalog = new CatalogService(bookRepo);
const orders  = new OrderService(bookRepo, orderRepo);

// --- HTTP ---
const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/books',  (_req, res) => res.json(catalog.list()));

app.post('/books', (req, res, next) => {
  try { res.status(201).json(catalog.addBook(req.body)); }
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

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError)    return res.status(400).json({ error: err.message });
  if (err instanceof BookNotFoundError)  return res.status(404).json({ error: err.message });
  if (err instanceof OrderNotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof OutOfStockError)    return res.status(409).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

app.listen(3000, () => console.log('v3 repository-pattern running on :3000'));

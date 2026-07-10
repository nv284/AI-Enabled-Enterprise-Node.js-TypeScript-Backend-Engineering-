// The "before" picture. ONE file, everything jammed together.
// Rules, SQL, HTTP responses, validation, wiring — all in the same function bodies.
// Do NOT copy this style. It exists to be refactored in v2..v6.

import express, { Request, Response } from 'express';
import Database from 'better-sqlite3';

const app = express();
app.use(express.json());

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

// seed a few books once
const count = (db.prepare('SELECT COUNT(*) AS c FROM books').get() as any).c;
if (count === 0) {
  const insert = db.prepare('INSERT INTO books (title, price, stock) VALUES (?, ?, ?)');
  insert.run('Clean Code',    500, 5);
  insert.run('The Pragmatic Programmer', 800, 3);
  insert.run('Refactoring',   900, 2);
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/books', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM books').all();
  res.json(rows);
});

app.post('/books', (req: Request, res: Response) => {
  const { title, price, stock } = req.body;
  // validation, SQL, response formatting — all mixed
  if (typeof title !== 'string' || title.length < 1) {
    return res.status(400).json({ error: 'title required' });
  }
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'price must be > 0' });
  }
  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ error: 'stock must be >= 0' });
  }
  const info = db.prepare('INSERT INTO books (title, price, stock) VALUES (?, ?, ?)')
    .run(title, price, stock);
  res.status(201).json({ id: info.lastInsertRowid, title, price, stock });
});

app.post('/orders', (req: Request, res: Response) => {
  const { customerId, bookId } = req.body;

  if (typeof customerId !== 'number' || typeof bookId !== 'number') {
    return res.status(400).json({ error: 'customerId and bookId required (numbers)' });
  }

  // Load book (SQL in route)
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as any;
  if (!book) return res.status(404).json({ error: 'book not found' });
  if (book.stock < 1) return res.status(409).json({ error: 'out of stock' });

  // Business rule (loyalty discount) — buried in the route
  const previous = (db.prepare('SELECT COUNT(*) AS c FROM orders WHERE customer_id = ?')
    .get(customerId) as any).c;
  const discount = previous >= 3 ? 0.1 : 0;
  const total = Math.round(book.price * (1 - discount));

  // Persist
  const info = db.prepare('INSERT INTO orders (customer_id, book_id, total) VALUES (?, ?, ?)')
    .run(customerId, bookId, total);
  db.prepare('UPDATE books SET stock = stock - 1 WHERE id = ?').run(bookId);

  res.status(201).json({
    id: info.lastInsertRowid,
    customerId,
    bookId,
    total,
    discountApplied: discount > 0
  });
});

app.get('/orders/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'order not found' });
  res.json(row);
});

app.listen(3000, () => console.log('v1 messy monolith running on :3000'));

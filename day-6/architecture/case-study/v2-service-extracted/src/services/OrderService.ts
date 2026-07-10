// Business rules for orders. Notice: no `req`, no `res`, but SQL still leaks in.
// That's fixed in v3.

import Database from 'better-sqlite3';
import { BookNotFoundError, OrderNotFoundError, OutOfStockError } from '../errors';

export interface Order {
  id: number;
  customerId: number;
  bookId: number;
  total: number;
  discountApplied: boolean;
}

export class OrderService {
  constructor(private readonly db: Database.Database) {}

  place(customerId: number, bookId: number): Order {
    const book = this.db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as
      { id: number; price: number; stock: number } | undefined;
    if (!book) throw new BookNotFoundError(bookId);
    if (book.stock < 1) throw new OutOfStockError(bookId);

    const previous = (this.db.prepare(
      'SELECT COUNT(*) AS c FROM orders WHERE customer_id = ?'
    ).get(customerId) as { c: number }).c;

    const discount = previous >= 3 ? 0.1 : 0;
    const total = Math.round(book.price * (1 - discount));

    const info = this.db.prepare(
      'INSERT INTO orders (customer_id, book_id, total) VALUES (?, ?, ?)'
    ).run(customerId, bookId, total);
    this.db.prepare('UPDATE books SET stock = stock - 1 WHERE id = ?').run(bookId);

    return {
      id: Number(info.lastInsertRowid),
      customerId, bookId, total,
      discountApplied: discount > 0,
    };
  }

  findById(id: number): Order {
    const row = this.db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as
      { id: number; customer_id: number; book_id: number; total: number } | undefined;
    if (!row) throw new OrderNotFoundError(id);
    return {
      id: row.id,
      customerId: row.customer_id,
      bookId: row.book_id,
      total: row.total,
      discountApplied: false,
    };
  }
}

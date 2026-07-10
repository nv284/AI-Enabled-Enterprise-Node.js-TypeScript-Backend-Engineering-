import { injectable, inject } from 'tsyringe';
import type Database from 'better-sqlite3';
import { Order } from '../../domain/Order';
import { OrderRepository } from '../../domain/ports/OrderRepository';
import { TOKENS } from '../../tokens';

interface OrderRow {
  id: number; customer_id: number; book_id: number; total: number; discount_applied: number;
}

@injectable()
export class SqliteOrderRepository implements OrderRepository {
  constructor(@inject(TOKENS.Database) private readonly db: Database.Database) {}

  save(order: Omit<Order, 'id'>): Order {
    const info = this.db.prepare(
      'INSERT INTO orders (customer_id, book_id, total, discount_applied) VALUES (?, ?, ?, ?)'
    ).run(order.customerId, order.bookId, order.total, order.discountApplied ? 1 : 0);
    return { id: Number(info.lastInsertRowid), ...order };
  }

  findById(id: number): Order | null {
    const row = this.db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow | undefined;
    return row ? this.toDomain(row) : null;
  }

  countByCustomer(customerId: number): number {
    return (this.db.prepare('SELECT COUNT(*) AS c FROM orders WHERE customer_id = ?')
      .get(customerId) as { c: number }).c;
  }

  private toDomain(row: OrderRow): Order {
    return {
      id: row.id,
      customerId: row.customer_id,
      bookId: row.book_id,
      total: row.total,
      discountApplied: row.discount_applied === 1,
    };
  }
}

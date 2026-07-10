import Database from 'better-sqlite3';
import { ValidationError } from '../errors';

export interface Book {
  id: number;
  title: string;
  price: number;
  stock: number;
}

export class CatalogService {
  constructor(private readonly db: Database.Database) {}

  list(): Book[] {
    return this.db.prepare('SELECT * FROM books').all() as Book[];
  }

  addBook(input: { title?: unknown; price?: unknown; stock?: unknown }): Book {
    const { title, price, stock } = input;
    if (typeof title !== 'string' || title.length < 1) {
      throw new ValidationError('title required');
    }
    if (typeof price !== 'number' || price <= 0) {
      throw new ValidationError('price must be > 0');
    }
    if (typeof stock !== 'number' || stock < 0) {
      throw new ValidationError('stock must be >= 0');
    }
    const info = this.db.prepare(
      'INSERT INTO books (title, price, stock) VALUES (?, ?, ?)'
    ).run(title, price, stock);
    return { id: Number(info.lastInsertRowid), title, price, stock };
  }
}

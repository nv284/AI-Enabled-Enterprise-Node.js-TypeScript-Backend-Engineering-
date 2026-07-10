import { injectable, inject } from 'tsyringe';
import type Database from 'better-sqlite3';
import { Book } from '../../domain/Book';
import { BookRepository } from '../../domain/ports/BookRepository';
import { TOKENS } from '../../tokens';

interface BookRow { id: number; title: string; price: number; stock: number }

@injectable()
export class SqliteBookRepository implements BookRepository {
  constructor(@inject(TOKENS.Database) private readonly db: Database.Database) {}

  findById(id: number): Book | null {
    const row = this.db.prepare('SELECT * FROM books WHERE id = ?').get(id) as BookRow | undefined;
    return row ? this.toDomain(row) : null;
  }

  findAll(): Book[] {
    return (this.db.prepare('SELECT * FROM books').all() as BookRow[]).map(r => this.toDomain(r));
  }

  save(book: Omit<Book, 'id'>): Book {
    const info = this.db.prepare(
      'INSERT INTO books (title, price, stock) VALUES (?, ?, ?)'
    ).run(book.title, book.price, book.stock);
    return { id: Number(info.lastInsertRowid), ...book };
  }

  decrementStock(id: number): void {
    this.db.prepare('UPDATE books SET stock = stock - 1 WHERE id = ?').run(id);
  }

  private toDomain(row: BookRow): Book {
    return { id: row.id, title: row.title, price: row.price, stock: row.stock };
  }
}

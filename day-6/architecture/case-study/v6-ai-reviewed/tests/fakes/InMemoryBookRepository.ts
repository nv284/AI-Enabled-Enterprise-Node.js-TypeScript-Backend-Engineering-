import { Book } from '../../src/domain/Book';
import { BookRepository } from '../../src/domain/ports/BookRepository';

export class InMemoryBookRepository implements BookRepository {
  private next = 1;
  private books = new Map<number, Book>();

  findById(id: number): Book | null { return this.books.get(id) ?? null; }
  findAll(): Book[]                  { return [...this.books.values()]; }

  save(book: Omit<Book, 'id'>): Book {
    const id = this.next++;
    const saved: Book = { id, ...book };
    this.books.set(id, saved);
    return saved;
  }

  decrementStock(id: number): void {
    const b = this.books.get(id);
    if (b) this.books.set(id, { ...b, stock: b.stock - 1 });
  }
}

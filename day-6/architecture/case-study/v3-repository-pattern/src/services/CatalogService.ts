import { BookRepository } from '../domain/ports/BookRepository';
import { Book } from '../domain/Book';
import { ValidationError } from '../domain/errors';

export class CatalogService {
  constructor(private readonly books: BookRepository) {}

  list(): Book[] {
    return this.books.findAll();
  }

  addBook(input: { title?: unknown; price?: unknown; stock?: unknown }): Book {
    const { title, price, stock } = input;
    if (typeof title !== 'string' || title.length < 1) throw new ValidationError('title required');
    if (typeof price !== 'number' || price <= 0)       throw new ValidationError('price must be > 0');
    if (typeof stock !== 'number' || stock < 0)        throw new ValidationError('stock must be >= 0');
    return this.books.save({ title, price, stock });
  }
}

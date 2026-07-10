import { z } from 'zod';
import { BookRepository } from '../domain/ports/BookRepository';
import { Book } from '../domain/Book';
import { ValidationError } from '../domain/errors';

const AddBookInput = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export class CatalogService {
  constructor(private readonly books: BookRepository) {}

  list(): Book[] {
    return this.books.findAll();
  }

  addBook(input: unknown): Book {
    const parsed = AddBookInput.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map(i => i.message).join('; '));
    }
    return this.books.save(parsed.data);
  }
}

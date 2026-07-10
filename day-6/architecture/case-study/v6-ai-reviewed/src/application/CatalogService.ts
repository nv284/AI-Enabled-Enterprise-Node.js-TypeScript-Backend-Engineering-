import { injectable, inject } from 'tsyringe';
import { z } from 'zod';
import type { BookRepository } from '../domain/ports/BookRepository';
import { Book } from '../domain/Book';
import { ValidationError } from '../domain/errors';
import { TOKENS } from '../tokens';

const AddBookInput = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

@injectable()
export class CatalogService {
  constructor(@inject(TOKENS.BookRepository) private readonly books: BookRepository) {}

  list(): Book[] { return this.books.findAll(); }

  addBook(input: unknown): Book {
    const parsed = AddBookInput.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map(i => i.message).join('; '));
    }
    return this.books.save(parsed.data);
  }
}

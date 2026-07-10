import { Book } from '../Book';

export interface BookRepository {
  findById(id: number): Book | null;
  findAll(): Book[];
  save(book: Omit<Book, 'id'>): Book;
  decrementStock(id: number): void;
}

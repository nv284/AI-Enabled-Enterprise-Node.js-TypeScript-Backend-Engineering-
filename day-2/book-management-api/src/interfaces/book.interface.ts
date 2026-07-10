import { components } from "../types/api";;

export type Book = components["schemas"]["Book"];
//export type CreateBookRequest = components["schemas"]["CreateBookRequest"];
//export type UpdateBookRequest = components["schemas"]["UpdateBookRequest"];
export class BookRepository {
    private books: Book[] = [];

    findAll(): Book[] {
        return this.books;
    }

    findById(id: number): Book | undefined {
        return this.books.find(b => b.id === id);
    }
}
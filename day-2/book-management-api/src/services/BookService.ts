import {components} from "../types/api";

type Book = components["schemas"]["Book"];
type CreateBookDto =
components["schemas"]["CreateBookRequest"];

export class BookService {

    create(dto: CreateBookDto): Book {

        return {
            id: Date.now(),
            ...dto,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

}
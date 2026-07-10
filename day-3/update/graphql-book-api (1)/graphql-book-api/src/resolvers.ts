import { GraphQLError } from "graphql";
import { AppContext } from "./context";
import { authors, Author } from "./data/authors";
import { books, Book, Genre } from "./data/books";

type SortOrder = "ASC" | "DESC";
type BookSortField = "TITLE" | "PRICE" | "PUBLISHED_YEAR" | "RATING";

interface BookFilter {
  search?: string;
  genre?: Genre;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  authorId?: string;
}

function notFound(entity: string, id: string): GraphQLError {
  return new GraphQLError(`${entity} with id "${id}" not found`, {
    extensions: { code: "NOT_FOUND", http: { status: 404 } }
  });
}

function badInput(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: "BAD_USER_INPUT", http: { status: 400 } }
  });
}

const sortFieldMap: Record<BookSortField, keyof Book> = {
  TITLE: "title",
  PRICE: "price",
  PUBLISHED_YEAR: "publishedYear",
  RATING: "rating"
};

let nextBookId = books.length + 1;
let nextAuthorId = authors.length + 1;

export const resolvers = {
  Query: {
    books: (
      _p: unknown,
      args: {
        filter?: BookFilter;
        sortBy?: BookSortField;
        sortOrder?: SortOrder;
        limit?: number;
        offset?: number;
      }
    ) => {
      const {
        filter = {},
        sortBy = "TITLE",
        sortOrder = "ASC",
        limit = 10,
        offset = 0
      } = args;

      if (limit < 1 || limit > 100) {
        throw badInput("limit must be between 1 and 100");
      }
      if (offset < 0) {
        throw badInput("offset must be >= 0");
      }

      let result = books.slice();

      if (filter.search) {
        const q = filter.search.toLowerCase();
        result = result.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.description.toLowerCase().includes(q)
        );
      }
      if (filter.genre) result = result.filter((b) => b.genre === filter.genre);
      if (filter.authorId) result = result.filter((b) => b.authorId === filter.authorId);
      if (typeof filter.minPrice === "number")
        result = result.filter((b) => b.price >= filter.minPrice!);
      if (typeof filter.maxPrice === "number")
        result = result.filter((b) => b.price <= filter.maxPrice!);
      if (typeof filter.minRating === "number")
        result = result.filter((b) => b.rating >= filter.minRating!);

      const key = sortFieldMap[sortBy];
      result.sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av < bv) return sortOrder === "ASC" ? -1 : 1;
        if (av > bv) return sortOrder === "ASC" ? 1 : -1;
        return 0;
      });

      const total = result.length;
      const items = result.slice(offset, offset + limit);
      return { items, total, limit, offset };
    },

    book: (_p: unknown, { id }: { id: string }) =>
      books.find((b) => b.id === id) ?? null,

    authors: () => authors,

    author: (_p: unknown, { id }: { id: string }) =>
      authors.find((a) => a.id === id) ?? null
  },

  Book: {
    // Uses DataLoader to batch author fetches across the whole GraphQL request.
    author: async (parent: Book, _a: unknown, ctx: AppContext) => {
      const author = await ctx.loaders.authorById.load(parent.authorId);
      if (!author) throw notFound("Author", parent.authorId);
      return author;
    }
  },

  Author: {
    books: (parent: Author, _a: unknown, ctx: AppContext) =>
      ctx.loaders.booksByAuthorId.load(parent.id),

    bookCount: async (parent: Author, _a: unknown, ctx: AppContext) => {
      const list = await ctx.loaders.booksByAuthorId.load(parent.id);
      return list.length;
    }
  },

  Mutation: {
    createBook: (
      _p: unknown,
      { input }: { input: Omit<Book, "id" | "rating"> & { rating?: number } }
    ) => {
      if (!authors.some((a) => a.id === input.authorId)) {
        throw notFound("Author", input.authorId);
      }
      if (input.price < 0) throw badInput("price must be >= 0");
      const rating = input.rating ?? 0;
      if (rating < 0 || rating > 5) throw badInput("rating must be between 0 and 5");

      const book: Book = {
        id: String(nextBookId++),
        title: input.title,
        price: input.price,
        authorId: input.authorId,
        genre: input.genre,
        publishedYear: input.publishedYear,
        description: input.description,
        rating
      };
      books.push(book);
      return book;
    },

    updateBook: (
      _p: unknown,
      { id, input }: { id: string; input: Partial<Book> }
    ) => {
      const book = books.find((b) => b.id === id);
      if (!book) throw notFound("Book", id);
      if (input.price !== undefined && input.price < 0)
        throw badInput("price must be >= 0");
      if (input.rating !== undefined && (input.rating < 0 || input.rating > 5))
        throw badInput("rating must be between 0 and 5");
      Object.assign(book, input);
      return book;
    },

    deleteBook: (_p: unknown, { id }: { id: string }) => {
      const idx = books.findIndex((b) => b.id === id);
      if (idx === -1) throw notFound("Book", id);
      books.splice(idx, 1);
      return { success: true, id };
    },

    createAuthor: (_p: unknown, { input }: { input: Omit<Author, "id"> }) => {
      const author: Author = { id: String(nextAuthorId++), ...input };
      authors.push(author);
      return author;
    }
  }
};
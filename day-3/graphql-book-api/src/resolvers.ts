import { books } from "./data/books";
import { authors } from "./data/authors";

export const resolvers = {

  Query: {

    books: (_: any, args: { filter: { title: string; authorName: string; }; sort: { field: any; order: string; }; pagination: { page: number; limit: number; }; }) => {

      let result = [...books];

      // Filtering
      if (args.filter?.title) {
        result = result.filter(book =>
          book.title
            .toLowerCase()
            .includes(args.filter.title.toLowerCase())
        );
      }

      if (args.filter?.authorName) {

        const authorIds = authors
          .filter(author =>
            author.name
              .toLowerCase()
              .includes(args.filter.authorName.toLowerCase())
          )
          .map(author => author.id);

        result = result.filter(book =>
          authorIds.includes(book.authorId)
        );
      }

      // Sorting
      if (args.sort) {

        result.sort((a, b) => {

          let value = 0;

          switch (args.sort.field) {

            case "PRICE":
              value = a.price - b.price;
              break;

            case "TITLE":
              value = a.title.localeCompare(b.title);
              break;

            case "PUBLISHED_YEAR":
              value = a.publishedYear - b.publishedYear;
              break;

            default:
              value = 0;
          }

          return args.sort.order === "DESC"
            ? -value
            : value;

        });

      }

      // Pagination
      const page = args.pagination?.page ?? 1;
      const limit = args.pagination?.limit ?? 10;

      const start = (page - 1) * limit;

      const items = result.slice(start, start + limit);

      return {

        items,

        pageInfo: {

          page,

          limit,

          totalRecords: result.length,

          totalPages: Math.ceil(result.length / limit),

          hasNextPage:
            page < Math.ceil(result.length / limit),

          hasPreviousPage: page > 1

        }

      };

    },

    book: (_: any, { id }: any) => {

      return books.find(book => book.id === id);

    },

    authors: (_: any, args: { pagination: { page: number; limit: number; }; }) => {

      const page = args.pagination?.page ?? 1;

      const limit = args.pagination?.limit ?? 10;

      const start = (page - 1) * limit;

      return {

        items: authors.slice(start, start + limit),

        pageInfo: {

          page,

          limit,

          totalRecords: authors.length,

          totalPages: Math.ceil(authors.length / limit),

          hasNextPage:
            page < Math.ceil(authors.length / limit),

          hasPreviousPage: page > 1

        }

      };

    },

    author: (_: any, { id }: any) => {

      return authors.find(author => author.id === id);

    }

  },

  Mutation: {

    createBook: (_: any, { input }: any) => {

      const newBook = {

        id: String(books.length + 1),

        ...input

      };

      books.push(newBook);

      return newBook;

    },

    updateBook: (_: any, { id, input }: any) => {

      const book = books.find(book => book.id === id);

      if (!book) {

        throw new Error("Book not found.");

      }

      Object.assign(book, input);

      return book;

    },

    deleteBook: (_: any, { id }: any) => {

      const index = books.findIndex(book => book.id === id);

      if (index === -1) {

        throw new Error("Book not found.");

      }

      books.splice(index, 1);

      return true;

    },

    createAuthor: (_: any, { input }: any) => {

      const newAuthor = {

        id: String(authors.length + 1),

        ...input

      };

      authors.push(newAuthor);

      return newAuthor;

    },

    updateAuthor: (_: any, { id, input }: any) => {

      const author = authors.find(a => a.id === id);

      if (!author) {

        throw new Error("Author not found.");

      }

      Object.assign(author, input);

      return author;

    },

    deleteAuthor: (_: any, { id }: any) => {

      const index = authors.findIndex(a => a.id === id);

      if (index === -1) {

        throw new Error("Author not found.");

      }

      authors.splice(index, 1);

      return true;

    }

  },

  Book: {

    author: (book: { authorId: string; }) => {

      return authors.find(
        author => author.id === book.authorId
      );

    }

  },

  Author: {

    books: (author: { id: string; }) => {

      return books.filter(
        book => book.authorId === author.id
      );

    }

  }

};
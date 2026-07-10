import DataLoader from "dataloader";
import { authors, Author } from "./data/authors";
import { books, Book } from "./data/books";

export interface AppContext {
  loaders: {
    authorById: DataLoader<string, Author | null>;
    booksByAuthorId: DataLoader<string, Book[]>;
  };
  requestId: string;
}

/**
 * Build a fresh set of loaders per request. DataLoader batches and caches
 * lookups within a single request to solve the classic GraphQL N+1 problem
 * (e.g. resolving `author` on 100 books becomes ONE batched lookup).
 */
export function createContext(): AppContext {
  const authorById = new DataLoader<string, Author | null>(async (ids) => {
    console.log(`[loader] authorById batch size=${ids.length}`);
    const map = new Map(authors.map((a) => [a.id, a]));
    return ids.map((id) => map.get(id) ?? null);
  });

  const booksByAuthorId = new DataLoader<string, Book[]>(async (ids) => {
    console.log(`[loader] booksByAuthorId batch size=${ids.length}`);
    return ids.map((id) => books.filter((b) => b.authorId === id));
  });

  return {
    loaders: { authorById, booksByAuthorId },
    requestId: Math.random().toString(36).slice(2, 10)
  };
}

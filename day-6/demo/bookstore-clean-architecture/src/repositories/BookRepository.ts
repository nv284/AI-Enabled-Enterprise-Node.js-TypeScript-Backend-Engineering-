/**
 * src/repositories/BookRepository.ts
 *
 * Repository interface for Book entities.
 *
 * Purpose:
 * - Defines the contract (interface) that the service/use-case layer depends on.
 * - Contains CRUD method signatures only — no implementation details, no database code.
 *
 * Why an interface-only repository?
 * - Dependency Inversion: high-level modules (services/use-cases) depend on abstractions,
 *   not concrete implementations. This allows swapping persistence implementations
 *   (SQLite, in-memory, file-based, or remote) without touching business logic.
 * - Testability: during unit tests you can provide a simple in-memory or mocked implementation
 *   of this interface to exercise business rules without a real database.
 * - Single Responsibility & Separation of Concerns: implementations focus on persistence (SQL),
 *   while services focus on orchestration and business rules.
 * - Explicit contract: the interface documents exactly how the domain expects to read/write books.
 *
 * Note on async vs sync:
 * - Repository methods are declared as returning Promises. This keeps the interface
 *   implementation-agnostic: concrete implementations that use synchronous drivers (like
 *   better-sqlite3) can still wrap results in Promise.resolve(), while async drivers can
 *   return real promises. Using async signatures improves portability.
 */

import { Book, NewBook, UpdateBook } from '../Book';

/**
 * BookRepository
 *
 * The repository contract the service layer will consume.
 *
 * Method semantics:
 * - create: persist a new book and return the fully populated Book (including id, timestamps).
 * - findById: return the Book or null if not found.
 * - findAll: return an array of Books (empty array if none).
 * - update: apply partial updates and return the updated Book or null if the book does not exist.
 * - delete: remove the book; successful deletion resolves void. Implementations may
 *           choose to throw an error if the target does not exist — services can map that.
 */
export interface BookRepository {
    /**
     * Create and persist a new book.
     * @param book New book data (no id, createdAt, updatedAt)
     * @returns Promise resolving to the created Book with id and timestamps populated
     */
    create(book: NewBook): Promise<Book>;

    /**
     * Find a book by its numeric id.
     * @param id Numeric identifier
     * @returns Promise resolving to Book or null when not found
     */
    findById(id: number): Promise<Book | null>;

    /**
     * Retrieve all books.
     * @returns Promise resolving to an array of Book objects (may be empty)
     */
    findAll(): Promise<Book[]>;

    /**
     * Update an existing book partially.
     * @param id Numeric identifier of the book to update
     * @param updates Partial fields to update
     * @returns Promise resolving to the updated Book, or null if the book was not found
     */
    update(id: number, updates: UpdateBook): Promise<Book | null>;

    /**
     * Delete a book by id.
     * @param id Numeric identifier
     * @returns Promise that resolves when deletion is complete. Implementations may
     *          choose to throw if the book does not exist (service layer should handle mapping).
     */
    delete(id: number): Promise<void>;
}
/**
 * src/repositories/SQLiteBookRepository.ts
 *
 * Concrete SQLite implementation of the BookRepository interface.
 *
 * Responsibilities:
 * - Implement CRUD operations for Book using parameterized SQL to avoid injection.
 * - Map database rows to domain Book objects.
 * - Keep SQL statements local to this infrastructure adapter so the rest of the
 *   application remains persistence-agnostic.
 *
 * Notes:
 * - better-sqlite3 is synchronous. The repository wraps results in Promises so the
 *   repository contract stays async-friendly and implementation-agnostic.
 * - Prepared statements are used for safety and (when reused) a small perf benefit.
 * - The class is decorated with tsyringe's @singleton to demonstrate DI lifetime management.
 */

import { singleton } from 'tsyringe';
import Database = require('better-sqlite3');
import { sqlite } from '../db/SQLiteDatabase';
import { Book, NewBook, UpdateBook } from '../models/Book';
import { BookRepository } from './BookRepository';

@singleton()
export class SQLiteBookRepository implements BookRepository {
    // Underlying better-sqlite3 Database instance (shared singleton)
    private readonly db: InstanceType<typeof Database>;

    constructor() {
        // Use the shared sqlite singleton created in src/db/SQLiteDatabase.ts
        this.db = sqlite.db;
    }

    /**
     * Map a raw DB row into the domain Book shape.
     * The DB stores timestamps as TEXT ISO strings; we keep that shape in the domain model.
     */
    private rowToBook(row: any): Book {
        return {
            id: row.id,
            title: row.title,
            author: row.author,
            price: row.price,
            isbn: row.isbn,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }

    /**
     * findAll
     *
     * SQL:
     * SELECT id, title, author, price, isbn, createdAt, updatedAt FROM books ORDER BY id ASC;
     *
     * Explanation:
     * - Selects all columns we need to populate the Book domain object.
     * - ORDER BY id ASC provides a stable ordering for list endpoints; not required but helpful.
     * - Uses no parameters because there are no external inputs in this query.
     */
    public async findAll(): Promise<Book[]> {
        const sql = `
      SELECT id, title, author, price, isbn, createdAt, updatedAt
      FROM books
      ORDER BY id ASC;
    `;
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(); // synchronous; returns an array of row objects

        const books: Book[] = rows.map((r: any) => this.rowToBook(r));
        return Promise.resolve(books);
    }

    /**
     * findById
     *
     * SQL:
     * SELECT id, title, author, price, isbn, createdAt, updatedAt FROM books WHERE id = ? LIMIT 1;
     *
     * Explanation:
     * - Parameterized query uses `?` placeholder to avoid SQL injection.
     * - LIMIT 1 is used because id is primary key; it is a small optimization.
     */
    public async findById(id: number): Promise<Book | null> {
        const sql = `
      SELECT id, title, author, price, isbn, createdAt, updatedAt
      FROM books
      WHERE id = ?
      LIMIT 1;
    `;
        const stmt = this.db.prepare(sql);
        const row = stmt.get(id); // returns single row or undefined

        if (!row) return Promise.resolve(null);
        return Promise.resolve(this.rowToBook(row));
    }

    /**
     * create
     *
     * SQL:
     * INSERT INTO books (title, author, price, isbn, createdAt, updatedAt)
     * VALUES (?, ?, ?, ?, ?, ?);
     *
     * Explanation:
     * - Parameterized INSERT with positional placeholders for safety.
     * - createdAt and updatedAt are assigned here using ISO-8601 strings to keep timestamp logic
     *   close to persistence (simple approach for the training app).
     * - After insertion we fetch the inserted row using the last inserted row id to return a full Book.
     */
    public async create(book: NewBook): Promise<Book> {
        const now = new Date().toISOString();

        const insertSQL = `
      INSERT INTO books (title, author, price, isbn, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
        const insertStmt = this.db.prepare(insertSQL);

        // Run the statement with parameterized values. info.lastInsertRowid contains the new id.
        const info = insertStmt.run(book.title, book.author, book.price, book.isbn, now, now);
        const newId = Number(info.lastInsertRowid);

        // Retrieve the newly created row to return a complete Book object.
        const created = await this.findById(newId);
        if (!created) {
            // This should not happen, but handle defensively.
            throw new Error('Failed to retrieve newly created book');
        }
        return created;
    }

    /**
     * update
     *
     * Behavior:
     * - Supports partial updates. Only provided fields are updated.
     * - If the book is not found, returns null.
     *
     * Implementation details:
     * - Build a parameterized UPDATE statement dynamically based on provided fields.
     * - Always update the updatedAt timestamp.
     *
     * Example resulting SQL (when updating title and price):
     * UPDATE books SET title = ?, price = ?, updatedAt = ? WHERE id = ?;
     */
    public async update(id: number, updates: UpdateBook): Promise<Book | null> {
        // Ensure the book exists first
        const existing = await this.findById(id);
        if (!existing) return Promise.resolve(null);

        // Collect set clauses and parameters
        const setClauses: string[] = [];
        const params: any[] = [];

        if (updates.title !== undefined) {
            setClauses.push('title = ?');
            params.push(updates.title);
        }
        if (updates.author !== undefined) {
            setClauses.push('author = ?');
            params.push(updates.author);
        }
        if (updates.price !== undefined) {
            setClauses.push('price = ?');
            params.push(updates.price);
        }
        if (updates.isbn !== undefined) {
            setClauses.push('isbn = ?');
            params.push(updates.isbn);
        }

        // If no updatable fields were provided, return the existing book unchanged.
        if (setClauses.length === 0) {
            return Promise.resolve(existing);
        }

        // Always update updatedAt
        const updatedAt = new Date().toISOString();
        setClauses.push('updatedAt = ?');
        params.push(updatedAt);

        // Add the id parameter for the WHERE clause
        params.push(id);

        const sql = `
      UPDATE books
      SET ${setClauses.join(', ')}
      WHERE id = ?;
    `;
        const stmt = this.db.prepare(sql);
        const info = stmt.run(...params);

        // info.changes indicates how many rows were changed.
        if (info.changes === 0) {
            // Could happen in race conditions; treat as not found.
            return Promise.resolve(null);
        }

        const updated = await this.findById(id);
        if (!updated) {
            // Defensive: if we can't load it back, surface an error.
            throw new Error('Failed to load updated book after update');
        }

        return updated;
    }

    /**
     * delete
     *
     * SQL:
     * DELETE FROM books WHERE id = ?;
     *
     * Explanation:
     * - Parameterized DELETE to remove the row with the provided id.
     * - If no row was deleted (changes === 0), we throw an error to signal "not found".
     *   The service layer can catch and translate this into a 404 HTTP response.
     */
    public async delete(id: number): Promise<void> {
        const sql = `DELETE FROM books WHERE id = ?;`;
        const stmt = this.db.prepare(sql);
        const info = stmt.run(id);

        if (info.changes === 0) {
            // No row deleted — communicate the absence with an error.
            throw new Error('Book not found');
        }

        return Promise.resolve();
    }
}

export default SQLiteBookRepository;
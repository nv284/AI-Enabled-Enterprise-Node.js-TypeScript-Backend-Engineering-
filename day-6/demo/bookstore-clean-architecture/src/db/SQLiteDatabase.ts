/**
 * src/db/SQLiteDatabase.ts
 *
 * Singleton wrapper around a better-sqlite3 Database instance.
 *
 * Responsibilities:
 * - Provide a single shared SQLite connection for the whole application.
 * - Initialize (auto-create) the `books` table and helpful indices on startup.
 * - Encapsulate low-level DB pragmas and filesystem path decisions in one place.
 *
 * Notes on design decisions:
 * - better-sqlite3 uses a synchronous API. For a small, teachable demo this keeps
 *   repository code straightforward. Repository implementations may wrap sync calls
 *   with Promise.resolve() to match async service signatures.
 * - The SQLite file is created under `./data/books.db` relative to the project root.
 *   This keeps database artifacts out of source folders but local to the project so
 *   trainees can inspect them easily.
 * - The class is a singleton to ensure only one connection / file handle is used.
 */


import * as fs from 'fs';
import path from 'path';
import BetterSqlite3 from 'better-sqlite3';

class SQLiteDatabase {
    // The singleton instance reference
    private static instance: SQLiteDatabase | null = null;

    // Expose the underlying better-sqlite3 Database object for repository usage.
    // Use InstanceType to get the instance type of the imported constructor.
    public readonly db: InstanceType<typeof BetterSqlite3>;

    // Private constructor prevents external instantiation.
    private constructor() {
        // Decide and create the directory that will hold the DB file.
        // Using a ./data directory keeps the DB out of src/ and dist/ while still local.
        const dbDir = path.resolve(process.cwd(), 'data');
        try {
            fs.mkdirSync(dbDir, { recursive: true });
        } catch (err) {
            // In production-grade code you'd handle this more gracefully.
            // For the training app we rethrow since failing to create the DB directory is fatal.
            throw new Error(`Failed to create DB directory at ${dbDir}: ${(err as Error).message}`);
        }

        // Path to the sqlite file.
        const dbPath = path.join(dbDir, 'books.db');

        // Open the database. better-sqlite3 opens the file synchronously.
        // Passing options such as readonly or fileMustExist can be used to alter behaviour.
        this.db = new BetterSqlite3(dbPath);

        // Set pragmatic PRAGMAs that are commonly useful:
        // - journal_mode = WAL improves concurrency for readers/writers.
        // - foreign_keys = ON enforces FK constraints (if used).
        // These are optional but demonstrate how to configure SQLite at startup.
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');

        // Initialize schema: create the books table if it doesn't exist.
        //
        // Explanation of the SQL statement below:
        //
        // CREATE TABLE IF NOT EXISTS books (
        //   id INTEGER PRIMARY KEY AUTOINCREMENT,
        //   title TEXT NOT NULL,
        //   author TEXT NOT NULL,
        //   price REAL NOT NULL,
        //   isbn TEXT NOT NULL UNIQUE,
        //   createdAt TEXT NOT NULL,
        //   updatedAt TEXT NOT NULL
        // );
        //
        // - CREATE TABLE IF NOT EXISTS books:
        //     Create a table named `books`. IF NOT EXISTS prevents error if the table already exists.
        // - id INTEGER PRIMARY KEY AUTOINCREMENT:
        //     An integer primary key that auto-increments. In SQLite this is the usual row id pattern.
        //     Using a numeric id keeps examples simple and maps directly to domain `id: number`.
        // - title TEXT NOT NULL:
        //     Title column, required. Text type stores Unicode strings.
        // - author TEXT NOT NULL:
        //     Author column, required. Kept simple as a single string for teaching.
        // - price REAL NOT NULL:
        //     Price stored as REAL (floating-point). For production monetary values prefer integer cents
        //     or a dedicated Money type to avoid floating point rounding issues.
        // - isbn TEXT NOT NULL UNIQUE:
        //     ISBN stored as TEXT and constrained to be unique. This demonstrates schema-level constraints.
        //     Unique helps teach the concept, but the service layer should still handle conflicts gracefully.
        // - createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL:
        //     Timestamps stored as ISO-8601 strings. Storing as TEXT simplifies JSON transport and teaching.
        //
        // The schema is intentionally compact and explicit to keep each column's purpose clear.
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL,
        isbn TEXT NOT NULL UNIQUE,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `;

        // Execute the table creation statement.
        this.db.exec(createTableSQL);

        // Create indices to speed up common queries (search by title or author).
        //
        // CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
        // - Creates an index on the title column to accelerate WHERE title = ? or ORDER BY title queries.
        //
        // CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
        // - Creates an index on the author column to accelerate lookups and filters by author.
        //
        // Indices are optional for a tiny dataset but they are commonly used in real systems
        // and are useful to demonstrate schema tuning.
        this.db.exec(`CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);`);
        this.db.exec(`CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);`);
    }

    /**
     * Get the singleton instance of SQLiteDatabase.
     * If it doesn't exist it will be created and schema initialization will run.
     */
    public static getInstance(): SQLiteDatabase {
        if (!SQLiteDatabase.instance) {
            SQLiteDatabase.instance = new SQLiteDatabase();
        }
        return SQLiteDatabase.instance;
    }
}

/**
 * Export a ready-to-use singleton instance.
 *
 * Usage:
 * import { sqlite } from './db/SQLiteDatabase';
 * const db = sqlite.db; // underlying better-sqlite3 Database object
 *
 * Repositories should import this singleton to prepare statements and execute queries.
 * Keeping the initialization logic here centralizes PRAGMA and schema decisions.
 */
export const sqlite = SQLiteDatabase.getInstance();
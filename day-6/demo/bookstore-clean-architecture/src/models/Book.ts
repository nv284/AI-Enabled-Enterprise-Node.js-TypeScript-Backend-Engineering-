/**
 * src/models/Book.ts
 *
 * Domain model definitions for "Book".
 *
 * Purpose:
 * - This file contains ONLY business/domain types (interfaces and small helper types).
 * - The domain layer's responsibility is to express the core business objects and rules
 *   in a framework-agnostic way. It should NOT import Express, SQLite, or other frameworks.
 *
 * Teaching notes (why domain contains only business objects):
 * - Clean Architecture / Hexagonal / Onion approaches recommend the domain be the innermost layer.
 *   That means domain types and business rules are pure and free from infrastructure concerns.
 * - Keeping the domain minimal and focused (no framework code, no persistence code, no HTTP types)
 *   makes it easy to reason about business logic, test it in isolation, and swap out outer layers
 *   (for example, replace SQLite with an in-memory repo) without touching domain definitions.
 * - Types and interfaces here represent the language of the business: services, repositories,
 *   and controllers will all depend on these shapes.
 *
 * Implementation choices in this file:
 * - Use an `interface` for `Book` because interfaces are idiomatic in TypeScript for describing
 *   the shape of domain entities and they are easily implemented or extended by other layers.
 * - `id` is a number because SQLite's INTEGER PRIMARY KEY is typically numeric and auto-incremented.
 * - `createdAt` / `updatedAt` are typed as `string` (ISO 8601 timestamps) rather than `Date`
 *   to keep persistence and serialization boundaries explicit and straightforward when sending JSON
 *   over HTTP. Using strings avoids accidental timezone/serialization pitfalls in small teaching apps.
 *   If you prefer `Date` objects for richer domain behavior, convert at the boundary (repository/controller).
 */

/**
 * Book
 *
 * The canonical domain representation of a Book in our system.
 * This interface should be used across services and repository contracts.
 */
export interface Book {
    /**
     * Unique identifier for the book.
     * - In SQLite this will typically map to INTEGER PRIMARY KEY (auto-increment).
     */
    id: number;

    /**
     * Human-readable title of the book.
     * Business rule examples (enforced at service layer, not here):
     * - non-empty string
     * - length limits (e.g., 1..255)
     */
    title: string;

    /**
     * Author name(s). For simplicity, a single string is used.
     * Could be normalized to an array if domain requirements change.
     */
    author: string;

    /**
     * Price in the smallest currency unit or decimal representation.
     * For this training example we use a number (e.g., 19.99). In a real e-commerce app
     * consider using an integer cents value or a Money type to avoid floating point issues.
     */
    price: number;

    /**
     * ISBN (International Standard Book Number) as a string.
     * No validation is performed here — validation belongs at the boundary (controller/service).
     */
    isbn: string;

    /**
     * ISO-8601 timestamp string of creation time (e.g., "2026-07-08T12:00:00.000Z").
     * Stored as string to simplify JSON transport and database mapping in this small example.
     */
    createdAt: string;

    /**
     * ISO-8601 timestamp string of last update.
     */
    updatedAt: string;
}

/**
 * NewBook
 *
 * Helper type for creating new books. When creating a Book, the client does not
 * provide `id`, `createdAt`, or `updatedAt` — those are assigned by the repository/service.
 */
export type NewBook = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * UpdateBook
 *
 * Helper type for updates. All fields are optional because partial updates are common.
 * Services/repositories should handle merging and validation rules.
 */
export type UpdateBook = Partial<NewBook>;
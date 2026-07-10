// Injection tokens — one place, autocompleted.
export const TOKENS = {
  Database:        Symbol.for('Database'),
  BookRepository:  Symbol.for('BookRepository'),
  OrderRepository: Symbol.for('OrderRepository'),
} as const;

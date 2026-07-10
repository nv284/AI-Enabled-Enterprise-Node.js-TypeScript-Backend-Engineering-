import Database from 'better-sqlite3';

export function openDatabase(path: string): Database.Database {
  const db = new Database(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, price INTEGER NOT NULL, stock INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL, book_id INTEGER NOT NULL,
      total INTEGER NOT NULL, discount_applied INTEGER NOT NULL DEFAULT 0
    );
  `);
  return db;
}

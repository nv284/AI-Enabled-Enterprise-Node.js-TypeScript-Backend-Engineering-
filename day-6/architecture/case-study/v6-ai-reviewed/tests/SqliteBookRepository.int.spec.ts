import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteBookRepository } from '../src/infrastructure/persistence/SqliteBookRepository';

const SCHEMA = `
  CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL
  );
`;

describe('SqliteBookRepository (integration)', () => {
  let repo: SqliteBookRepository;

  beforeEach(() => {
    const db = new Database(':memory:');
    db.exec(SCHEMA);
    repo = new SqliteBookRepository(db);
  });

  it('round-trips a book by id', () => {
    const saved = repo.save({ title: 'DDD', price: 700, stock: 4 });
    expect(repo.findById(saved.id)).toEqual(saved);
  });

  it('findAll returns everything', () => {
    repo.save({ title: 'a', price: 10, stock: 1 });
    repo.save({ title: 'b', price: 20, stock: 1 });
    expect(repo.findAll()).toHaveLength(2);
  });

  it('findById returns null for missing', () => {
    expect(repo.findById(404)).toBeNull();
  });

  it('decrementStock lowers stock by 1', () => {
    const s = repo.save({ title: 'x', price: 10, stock: 3 });
    repo.decrementStock(s.id);
    expect(repo.findById(s.id)?.stock).toBe(2);
  });
});

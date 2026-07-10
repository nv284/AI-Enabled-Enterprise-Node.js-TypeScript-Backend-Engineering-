import { describe, it, expect, beforeEach } from 'vitest';
import { CatalogService } from '../src/application/CatalogService';
import { ValidationError } from '../src/domain/errors';
import { InMemoryBookRepository } from './fakes/InMemoryBookRepository';

describe('CatalogService.addBook', () => {
  let repo: InMemoryBookRepository;
  let svc:  CatalogService;

  beforeEach(() => {
    repo = new InMemoryBookRepository();
    svc  = new CatalogService(repo);
  });

  it('adds a valid book', () => {
    const b = svc.addBook({ title: 't', price: 100, stock: 2 });
    expect(b.id).toBeGreaterThan(0);
    expect(repo.findAll()).toHaveLength(1);
  });

  it('rejects empty title', () => {
    expect(() => svc.addBook({ title: '', price: 100, stock: 2 })).toThrow(ValidationError);
  });

  it('rejects zero price', () => {
    expect(() => svc.addBook({ title: 't', price: 0, stock: 2 })).toThrow(ValidationError);
  });

  it('rejects negative stock', () => {
    expect(() => svc.addBook({ title: 't', price: 10, stock: -1 })).toThrow(ValidationError);
  });
});

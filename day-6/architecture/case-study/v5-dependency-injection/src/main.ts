// Composition root — now using tsyringe.
import 'reflect-metadata';
import { container } from 'tsyringe';
import express from 'express';

import { TOKENS } from './tokens';
import { openDatabase } from './infrastructure/persistence/db';
import { SqliteBookRepository }  from './infrastructure/persistence/SqliteBookRepository';
import { SqliteOrderRepository } from './infrastructure/persistence/SqliteOrderRepository';
import { CatalogService } from './application/CatalogService';
import { OrderService }   from './application/OrderService';
import { buildRouter }    from './presentation/http/router';
import { errorMiddleware } from './presentation/http/middleware';

export function buildApp(opts: { dbFile?: string; seed?: boolean } = {}) {
  const db = openDatabase(opts.dbFile ?? 'bookstore.db');

  // 1. Register infrastructure values + adapters
  container.registerInstance(TOKENS.Database, db);
  container.register(TOKENS.BookRepository,  { useClass: SqliteBookRepository });
  container.register(TOKENS.OrderRepository, { useClass: SqliteOrderRepository });

  // 2. Resolve services — dependencies are wired automatically
  const catalog = container.resolve(CatalogService);
  const orders  = container.resolve(OrderService);

  // 3. Seed if needed
  if (opts.seed && catalog.list().length === 0) {
    catalog.addBook({ title: 'Clean Code', price: 500, stock: 5 });
    catalog.addBook({ title: 'The Pragmatic Programmer', price: 800, stock: 3 });
    catalog.addBook({ title: 'Refactoring', price: 900, stock: 2 });
  }

  // 4. Build HTTP
  const app = express();
  app.use(express.json());
  app.use(buildRouter(catalog, orders));
  app.use(errorMiddleware);
  return app;
}

if (require.main === module) {
  const app = buildApp({ seed: true });
  app.listen(3000, () => console.log('v5 dependency-injection running on :3000'));
}

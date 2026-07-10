// Composition root — the ONLY file that constructs concrete infrastructure.
// Read this top-to-bottom and you understand the whole app.

import express from 'express';

import { openDatabase } from './infrastructure/persistence/db';
import { SqliteBookRepository }  from './infrastructure/persistence/SqliteBookRepository';
import { SqliteOrderRepository } from './infrastructure/persistence/SqliteOrderRepository';
import { CatalogService } from './application/CatalogService';
import { OrderService }   from './application/OrderService';
import { buildRouter }    from './presentation/http/router';
import { errorMiddleware } from './presentation/http/middleware';

export function buildApp(opts: { dbFile?: string; seed?: boolean } = {}) {
  const db = openDatabase(opts.dbFile ?? 'bookstore.db');
  const bookRepo  = new SqliteBookRepository(db);
  const orderRepo = new SqliteOrderRepository(db);

  if (opts.seed && bookRepo.findAll().length === 0) {
    bookRepo.save({ title: 'Clean Code', price: 500, stock: 5 });
    bookRepo.save({ title: 'The Pragmatic Programmer', price: 800, stock: 3 });
    bookRepo.save({ title: 'Refactoring', price: 900, stock: 2 });
  }

  const catalog = new CatalogService(bookRepo);
  const orders  = new OrderService(bookRepo, orderRepo);

  const app = express();
  app.use(express.json());
  app.use(buildRouter(catalog, orders));
  app.use(errorMiddleware);
  return app;
}

if (require.main === module) {
  const app = buildApp({ seed: true });
  app.listen(3000, () => console.log('v4 clean-architecture running on :3000'));
}

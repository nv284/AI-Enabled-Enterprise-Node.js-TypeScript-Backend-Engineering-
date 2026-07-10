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
  // Fresh child container so tests can call buildApp() many times without cross-talk.
  const c = container.createChildContainer();

  const db = openDatabase(opts.dbFile ?? 'bookstore.db');
  c.registerInstance(TOKENS.Database, db);
  c.register(TOKENS.BookRepository,  { useClass: SqliteBookRepository });
  c.register(TOKENS.OrderRepository, { useClass: SqliteOrderRepository });

  const catalog = c.resolve(CatalogService);
  const orders  = c.resolve(OrderService);

  if (opts.seed && catalog.list().length === 0) {
    catalog.addBook({ title: 'Clean Code', price: 500, stock: 5 });
    catalog.addBook({ title: 'The Pragmatic Programmer', price: 800, stock: 3 });
    catalog.addBook({ title: 'Refactoring', price: 900, stock: 2 });
  }

  const app = express();
  app.use(express.json());
  app.use(buildRouter(catalog, orders));
  app.use(errorMiddleware);
  return app;
}

if (require.main === module) {
  const app = buildApp({ seed: true });
  app.listen(3000, () => console.log('v6 ai-reviewed running on :3000'));
}

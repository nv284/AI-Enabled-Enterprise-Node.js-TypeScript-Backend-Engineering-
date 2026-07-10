import { Router } from 'express';
import { makeBookController } from './bookController';
import { makeOrderController } from './orderController';
import { CatalogService } from '../../application/CatalogService';
import { OrderService } from '../../application/OrderService';
import { asHandler } from './middleware';

export function buildRouter(catalog: CatalogService, orders: OrderService) {
  const r = Router();
  const b = makeBookController(catalog);
  const o = makeOrderController(orders);

  r.get('/health', (_req, res) => res.json({ status: 'ok' }));
  r.get('/books',      asHandler(b.list));
  r.post('/books',     asHandler(b.create));
  r.post('/orders',    asHandler(o.create));
  r.get('/orders/:id', asHandler(o.getById));

  return r;
}

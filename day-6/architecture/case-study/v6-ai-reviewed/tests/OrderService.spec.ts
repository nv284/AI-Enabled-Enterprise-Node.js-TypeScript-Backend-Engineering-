import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService } from '../src/application/OrderService';
import { BookNotFoundError, OrderNotFoundError, OutOfStockError } from '../src/domain/errors';
import { InMemoryBookRepository }  from './fakes/InMemoryBookRepository';
import { InMemoryOrderRepository } from './fakes/InMemoryOrderRepository';

describe('OrderService', () => {
  let books:  InMemoryBookRepository;
  let orders: InMemoryOrderRepository;
  let svc:    OrderService;

  beforeEach(() => {
    books  = new InMemoryBookRepository();
    orders = new InMemoryOrderRepository();
    svc    = new OrderService(books, orders);
  });

  describe('place', () => {
    it('places at full price for a new customer', () => {
      const b = books.save({ title: 'x', price: 500, stock: 5 });
      const order = svc.place(1, b.id);
      expect(order.total).toBe(500);
      expect(order.discountApplied).toBe(false);
    });

    it('applies 10% loyalty discount after 3 previous orders', () => {
      const b = books.save({ title: 'x', price: 1000, stock: 10 });
      for (let i = 0; i < 3; i++) {
        orders.save({ customerId: 42, bookId: b.id, total: 1000, discountApplied: false });
      }
      const order = svc.place(42, b.id);
      expect(order.total).toBe(900);
      expect(order.discountApplied).toBe(true);
    });

    it('decrements stock by 1', () => {
      const b = books.save({ title: 'x', price: 100, stock: 3 });
      svc.place(1, b.id);
      expect(books.findById(b.id)?.stock).toBe(2);
    });

    it('throws BookNotFoundError when book is missing', () => {
      expect(() => svc.place(1, 999)).toThrow(BookNotFoundError);
    });

    it('throws OutOfStockError when stock is 0', () => {
      const b = books.save({ title: 'x', price: 100, stock: 0 });
      expect(() => svc.place(1, b.id)).toThrow(OutOfStockError);
    });
  });

  describe('findById', () => {
    it('returns saved order', () => {
      const b = books.save({ title: 'x', price: 100, stock: 1 });
      const placed = svc.place(1, b.id);
      expect(svc.findById(placed.id)).toEqual(placed);
    });

    it('throws OrderNotFoundError when missing', () => {
      expect(() => svc.findById(9999)).toThrow(OrderNotFoundError);
    });
  });
});

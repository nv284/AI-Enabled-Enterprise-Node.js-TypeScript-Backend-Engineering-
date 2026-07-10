import { BookRepository } from '../domain/ports/BookRepository';
import { OrderRepository } from '../domain/ports/OrderRepository';
import { Order } from '../domain/Order';
import { BookNotFoundError, OrderNotFoundError, OutOfStockError } from '../domain/errors';

export class OrderService {
  constructor(
    private readonly books: BookRepository,
    private readonly orders: OrderRepository,
  ) {}

  place(customerId: number, bookId: number): Order {
    // Load
    const book = this.books.findById(bookId);
    if (!book) throw new BookNotFoundError(bookId);
    if (book.stock < 1) throw new OutOfStockError(bookId);

    // Decide
    const previous = this.orders.countByCustomer(customerId);
    const discount = previous >= 3 ? 0.1 : 0;
    const total = Math.round(book.price * (1 - discount));

    // Persist
    const saved = this.orders.save({
      customerId, bookId, total,
      discountApplied: discount > 0,
    });
    this.books.decrementStock(bookId);
    return saved;
  }

  findById(id: number): Order {
    const order = this.orders.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    return order;
  }
}

import { Order } from '../../src/domain/Order';
import { OrderRepository } from '../../src/domain/ports/OrderRepository';

export class InMemoryOrderRepository implements OrderRepository {
  private next = 1;
  private orders: Order[] = [];

  save(order: Omit<Order, 'id'>): Order {
    const saved: Order = { id: this.next++, ...order };
    this.orders.push(saved);
    return saved;
  }
  findById(id: number): Order | null {
    return this.orders.find(o => o.id === id) ?? null;
  }
  countByCustomer(customerId: number): number {
    return this.orders.filter(o => o.customerId === customerId).length;
  }
}

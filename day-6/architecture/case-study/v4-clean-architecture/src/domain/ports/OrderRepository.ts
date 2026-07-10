import { Order } from '../Order';

export interface OrderRepository {
  save(order: Omit<Order, 'id'>): Order;
  findById(id: number): Order | null;
  countByCustomer(customerId: number): number;
}

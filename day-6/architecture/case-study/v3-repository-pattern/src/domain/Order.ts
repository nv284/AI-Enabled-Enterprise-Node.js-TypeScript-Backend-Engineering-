export interface Order {
  id: number;
  customerId: number;
  bookId: number;
  total: number;
  discountApplied: boolean;
}

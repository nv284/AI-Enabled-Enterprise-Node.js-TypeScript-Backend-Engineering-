// Domain error classes — services throw these, controllers translate to HTTP.
export class BookNotFoundError extends Error {
  constructor(public readonly bookId: number) { super(`book ${bookId} not found`); }
}
export class OutOfStockError extends Error {
  constructor(public readonly bookId: number) { super(`book ${bookId} out of stock`); }
}
export class OrderNotFoundError extends Error {
  constructor(public readonly orderId: number) { super(`order ${orderId} not found`); }
}
export class ValidationError extends Error {}

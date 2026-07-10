import { Request, Response } from 'express';
import { OrderService } from '../../application/OrderService';
import { ValidationError } from '../../domain/errors';

export const makeOrderController = (svc: OrderService) => ({
  create(req: Request, res: Response) {
    const { customerId, bookId } = req.body ?? {};
    if (typeof customerId !== 'number' || typeof bookId !== 'number') {
      throw new ValidationError('customerId and bookId required (numbers)');
    }
    res.status(201).json(svc.place(customerId, bookId));
  },
  getById(req: Request, res: Response) {
    res.json(svc.findById(Number(req.params.id)));
  },
});

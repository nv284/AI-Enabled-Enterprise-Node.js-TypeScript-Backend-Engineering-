import { Request, Response } from 'express';
import { CatalogService } from '../../application/CatalogService';

export const makeBookController = (svc: CatalogService) => ({
  list(_req: Request, res: Response) { res.json(svc.list()); },
  create(req: Request, res: Response) { res.status(201).json(svc.addBook(req.body)); },
});

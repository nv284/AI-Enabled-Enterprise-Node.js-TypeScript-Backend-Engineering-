type Request = { [key: string]: any };
type Response = { status: (code: number) => Response; json: (body: unknown) => Response };
type NextFunction = (err?: unknown) => void;
import {
  BookNotFoundError, OrderNotFoundError, OutOfStockError, ValidationError,
} from '../../domain/errors';

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
  if (err instanceof BookNotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof OrderNotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof OutOfStockError) return res.status(409).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'internal error' });
}

export const asHandler =
  (fn: (req: Request, res: Response) => unknown | Promise<unknown>) =>
    (req: Request, res: Response, next: NextFunction) => {
      try { Promise.resolve(fn(req, res)).catch(next); }
      catch (e) { next(e); }
    };

import { Request, Response } from 'express';
import { books } from '../models/book.js';
export const getBooks = (_: Request, res: Response) => res.json(books);
export const getBook = (req: Request, res: Response) => {
    const b = books.find(x => x.id === Number(req.params.id)); if (!b)
        return res.status(404).json({ message: 'Not found' }); res.json(b);
};
export const createBook = (req: Request, res: Response) => {
    const b = { id: Date.now(), ...req.body };
    books.push(b as any); res.status(201).json(b);
};
export const updateBook = (req: Request, res: Response) => {
    const i = books.findIndex(x => x.id === Number(req.params.id));
    if (i < 0) return res.status(404).json({ message: 'Not found' });
    books[i] = { ...(books[i] as any), ...req.body }; res.json(books[i]);
};
export const deleteBook = (req: Request, res: Response) => {
    const i = books.findIndex(x => x.id === Number(req.params.id));
    if (i < 0) return res.status(404).json({ message: 'Not found' });
    books.splice(i, 1); res.status(204).send();
};
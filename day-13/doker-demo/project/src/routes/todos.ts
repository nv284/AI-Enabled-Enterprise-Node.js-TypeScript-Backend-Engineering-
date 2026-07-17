import { Router, Request, Response } from 'express';

type Todo = { id: number; title: string; done: boolean };

const todos: Todo[] = [
  { id: 1, title: 'Learn Docker', done: false },
  { id: 2, title: 'Write a Dockerfile', done: false },
];

export const todosRouter = Router();

todosRouter.get('/', (_req: Request, res: Response) => {
  res.json(todos);
});

todosRouter.post('/', (req: Request, res: Response) => {
  const title = String(req.body?.title ?? '').trim();
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const todo: Todo = {
    id: todos.length ? todos[todos.length - 1].id + 1 : 1,
    title,
    done: false,
  };
  todos.push(todo);
  res.status(201).json(todo);
});

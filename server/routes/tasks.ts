import { Router, Request, Response } from 'express';
import * as store from '../services/taskStore.js';

const router = Router();

router.get('/tasks', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  res.json(store.getAllTasks(status));
});

router.get('/tasks/:id', (req: Request, res: Response) => {
  const task = store.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});

router.post('/tasks', (req: Request, res: Response) => {
  const task = store.createTask(req.body);
  res.status(201).json(task);
});

router.patch('/tasks/:id', (req: Request, res: Response) => {
  const task = store.updateTask(req.params.id, req.body);
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});

router.delete('/tasks/:id', (req: Request, res: Response) => {
  const ok = store.deleteTask(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.post('/tasks/reorder', (req: Request, res: Response) => {
  store.reorderTasks(req.body.updates || []);
  res.json({ ok: true });
});

router.get('/activity', (_req: Request, res: Response) => {
  const limit = parseInt(_req.query.limit as string) || 50;
  res.json(store.getActivity(limit));
});

export default router;

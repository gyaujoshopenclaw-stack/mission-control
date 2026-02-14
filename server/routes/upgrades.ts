import { Router, Request, Response } from 'express';
import * as store from '../services/upgradeStore.js';

const router = Router();

router.get('/upgrades', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  res.json(store.getAllUpgrades(status));
});

router.get('/upgrades/:id', (req: Request, res: Response) => {
  const upgrade = store.getUpgrade(req.params.id);
  if (!upgrade) return res.status(404).json({ error: 'Not found' });
  res.json(upgrade);
});

router.patch('/upgrades/:id', (req: Request, res: Response) => {
  const upgrade = store.updateUpgrade(req.params.id, req.body);
  if (!upgrade) return res.status(404).json({ error: 'Not found' });
  res.json(upgrade);
});

router.delete('/upgrades/:id', (req: Request, res: Response) => {
  const ok = store.deleteUpgrade(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.post('/upgrades/generate', async (req: Request, res: Response) => {
  try {
    const upgrades = await store.generateUpgrades();
    res.status(201).json(upgrades);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to generate upgrades' });
  }
});

export default router;

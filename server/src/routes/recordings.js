import { Router } from 'express';
import { getAllRecordings } from '../services/db.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(getAllRecordings());
});

export default router;

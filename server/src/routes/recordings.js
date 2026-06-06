import { Router } from 'express';
import { getAllRecordings, getRecordingById } from '../services/db.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(getAllRecordings());
});

router.get('/:id/status', (req, res) => {
  const recording = getRecordingById(req.params.id);
  if (!recording) {
    res.status(404).json({ error: 'Recording not found' });
    return;
  }
  res.json({ id: recording.id, status: recording.status });
});

export default router;

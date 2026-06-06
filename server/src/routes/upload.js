import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { upload } from '../middleware/upload.js';
import { insertRecording, updateRecordingAfterConversion } from '../services/db.js';
import { convertWebmToMp4 } from '../services/ffmpeg.js';

const router = Router();

function defaultTitle() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `Recording ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

router.post('/', upload.single('video'), (req, res, next) => {
  if (!req.file) {
    res.status(400).json({ error: 'Missing video file' });
    return;
  }

  const id = uuidv4();
  const timestamp = Date.now();
  const filename = `rec_${timestamp}.mp4`;
  const hasWebcam = req.body.has_webcam === 'true';
  const duration = Number.parseInt(req.body.duration, 10) || null;
  const createdAt = new Date().toISOString();
  const webmPath = req.file.path;
  const mp4Path = path.join(config.recordingsDir, filename);

  try {
    insertRecording({
      id,
      title: defaultTitle(),
      filename,
      duration,
      size_bytes: null,
      has_webcam: hasWebcam,
      created_at: createdAt,
      status: 'processing',
    });
  } catch (err) {
    fs.unlink(webmPath, () => {});
    next(err);
    return;
  }

  res.status(202).json({ id, status: 'processing' });

  convertWebmToMp4(webmPath, mp4Path)
    .then(() => {
      const stats = fs.statSync(mp4Path);
      updateRecordingAfterConversion(id, {
        duration,
        size_bytes: stats.size,
        status: 'ready',
      });
      fs.unlink(webmPath, () => {});
    })
    .catch((err) => {
      console.error(`FFmpeg conversion failed for ${id}:`, err);
      updateRecordingAfterConversion(id, { status: 'error' });
      fs.unlink(webmPath, () => {});
      if (fs.existsSync(mp4Path)) {
        fs.unlink(mp4Path, () => {});
      }
    });
});

export default router;

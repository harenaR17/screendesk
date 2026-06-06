import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { config } from '../config.js';

fs.mkdirSync(config.tmpDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.tmpDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `upload_${Date.now()}${ext}`);
  },
});

// Wired up in Phase 3 for POST /api/upload.
export const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE) || 2 * 1024 * 1024 * 1024,
  },
});

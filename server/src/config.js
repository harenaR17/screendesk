import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bundledFfmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

function resolvePath(envValue, fallback) {
  const value = envValue || fallback;
  return path.isAbsolute(value) ? value : path.resolve(ROOT_DIR, value);
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  recordingsDir: resolvePath(process.env.RECORDINGS_DIR, 'recordings'),
  tmpDir: resolvePath(process.env.TMP_DIR, 'tmp'),
  dbPath: resolvePath(process.env.DB_PATH, 'db/screendeck.db'),
  ffmpegPath: process.env.FFMPEG_PATH || bundledFfmpegPath,
};

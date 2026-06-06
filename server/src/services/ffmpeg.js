import { spawn } from 'child_process';
import { config } from '../config.js';

export function verifyFfmpegAvailable() {
  return new Promise((resolve, reject) => {
    const proc = spawn(config.ffmpegPath, ['-version'], { stdio: 'ignore' });
    proc.on('error', () => {
      reject(
        new Error(
          `FFmpeg not found at "${config.ffmpegPath}". Run npm install in the repo root, or set FFMPEG_PATH in .env.`,
        ),
      );
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}

export function convertWebmToMp4(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-i',
      inputPath,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '22',
      '-c:a',
      'aac',
      '-movflags',
      '+faststart',
      '-y',
      outputPath,
    ];

    const proc = spawn(config.ffmpegPath, args);
    let stderr = '';

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('error', (err) => reject(err));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `FFmpeg exited with code ${code}`));
    });
  });
}

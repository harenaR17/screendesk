import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { config } from '../config.js';

let db;

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS recordings (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  filename    TEXT NOT NULL UNIQUE,
  duration    INTEGER,
  size_bytes  INTEGER,
  has_webcam  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
`;

export function initDb() {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
  fs.mkdirSync(config.recordingsDir, { recursive: true });
  fs.mkdirSync(config.tmpDir, { recursive: true });

  db = new DatabaseSync(config.dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec(MIGRATION_SQL);
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

export function getAllRecordings() {
  return getDb()
    .prepare(
      `SELECT id, title, filename, duration, size_bytes, has_webcam, created_at
       FROM recordings
       ORDER BY datetime(created_at) DESC`
    )
    .all()
    .map((row) => ({
      ...row,
      has_webcam: Boolean(row.has_webcam),
    }));
}

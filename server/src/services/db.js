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

function mapRow(row) {
  return {
    ...row,
    has_webcam: Boolean(row.has_webcam),
  };
}

function ensureStatusColumn() {
  const columns = getDb().prepare('PRAGMA table_info(recordings)').all();
  if (!columns.some((col) => col.name === 'status')) {
    getDb().exec(
      `ALTER TABLE recordings ADD COLUMN status TEXT NOT NULL DEFAULT 'ready'`,
    );
  }
}

export function initDb() {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
  fs.mkdirSync(config.recordingsDir, { recursive: true });
  fs.mkdirSync(config.tmpDir, { recursive: true });

  db = new DatabaseSync(config.dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec(MIGRATION_SQL);
  ensureStatusColumn();
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
      `SELECT id, title, filename, duration, size_bytes, has_webcam, created_at, status
       FROM recordings
       ORDER BY datetime(created_at) DESC`,
    )
    .all()
    .map(mapRow);
}

export function getRecordingById(id) {
  const row = getDb()
    .prepare(
      `SELECT id, title, filename, duration, size_bytes, has_webcam, created_at, status
       FROM recordings WHERE id = ?`,
    )
    .get(id);
  return row ? mapRow(row) : null;
}

export function insertRecording(recording) {
  getDb()
    .prepare(
      `INSERT INTO recordings
       (id, title, filename, duration, size_bytes, has_webcam, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      recording.id,
      recording.title,
      recording.filename,
      recording.duration,
      recording.size_bytes,
      recording.has_webcam ? 1 : 0,
      recording.created_at,
      recording.status,
    );
}

export function updateRecordingAfterConversion(id, fields) {
  const updates = [];
  const values = [];

  if (fields.duration !== undefined) {
    updates.push('duration = ?');
    values.push(fields.duration);
  }
  if (fields.size_bytes !== undefined) {
    updates.push('size_bytes = ?');
    values.push(fields.size_bytes);
  }
  if (fields.status !== undefined) {
    updates.push('status = ?');
    values.push(fields.status);
  }

  if (updates.length === 0) return;

  values.push(id);
  getDb()
    .prepare(`UPDATE recordings SET ${updates.join(', ')} WHERE id = ?`)
    .run(...values);
}

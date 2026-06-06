import { MOCK_RECORDINGS } from './mockData.js';

// In-memory store standing in for the backend. Mutated by the mock mutations
// below so the UI reflects changes during a session.
let recordings = [...MOCK_RECORDINGS];

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export async function fetchRecordings() {
  // TODO: replace with real fetch GET /api/recordings
  await delay();
  return [...recordings].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

export async function deleteRecording(id) {
  // TODO: replace with real fetch DELETE /api/recordings/:id
  await delay();
  recordings = recordings.filter((r) => r.id !== id);
}

export async function renameRecording(id, title) {
  // TODO: replace with real fetch PATCH /api/recordings/:id
  await delay();
  recordings = recordings.map((r) => (r.id === id ? { ...r, title } : r));
  return recordings.find((r) => r.id === id);
}

export async function uploadRecording(blob, meta) {
  // TODO: replace with real fetch POST /api/upload
  await delay(2000); // simulate upload + FFmpeg time
  const newRec = {
    id: `rec-${Date.now()}`,
    title: `Recording ${new Date().toLocaleString()}`,
    filename: `rec_${Date.now()}.mp4`,
    duration: meta.duration,
    size_bytes: blob.size,
    has_webcam: meta.has_webcam,
    status: 'ready',
    created_at: new Date().toISOString(),
  };
  recordings = [newRec, ...recordings];
  return newRec;
}

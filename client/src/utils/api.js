import { MOCK_RECORDINGS } from './mockData.js';

// In-memory store for delete/rename until Phase 4 wires real endpoints.
let recordings = [...MOCK_RECORDINGS];

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

async function parseJsonResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchRecordings() {
  const res = await fetch('/api/recordings');
  return parseJsonResponse(res);
}

export async function deleteRecording(id) {
  await delay();
  recordings = recordings.filter((r) => r.id !== id);
}

export async function renameRecording(id, title) {
  await delay();
  recordings = recordings.map((r) => (r.id === id ? { ...r, title } : r));
  return recordings.find((r) => r.id === id);
}

export function uploadRecording(blob, meta, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('video', blob, 'recording.webm');
    formData.append('has_webcam', meta.has_webcam ? 'true' : 'false');
    formData.append('duration', String(meta.duration ?? 0));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.responseType = 'json';

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      const status = xhr.status;
      const body = xhr.response;

      if (status === 202 || status === 200) {
        resolve(body);
        return;
      }

      const message = body?.error || `Upload failed (${status})`;
      reject(new Error(message));
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

export async function pollRecordingStatus(id, { intervalMs = 2000, signal } = {}) {
  while (true) {
    if (signal?.aborted) {
      throw new Error('Polling cancelled');
    }

    const res = await fetch(`/api/recordings/${id}/status`);
    const body = await parseJsonResponse(res);

    if (body.status === 'ready' || body.status === 'error') {
      return body;
    }

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, intervalMs);
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timeout);
          reject(new Error('Polling cancelled'));
        },
        { once: true },
      );
    });
  }
}

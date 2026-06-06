# ScreenDeck — Implementation Plan
> A self-hosted, local-first screen recording web app inspired by Loom.
> Hosted at `loom.example.com` · Solo use · No cloud dependency · MP4 output

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Data Model](#5-data-model)
6. [API Contract](#6-api-contract)
7. [Frontend Screens & Components](#7-frontend-screens--components)
8. [Building Phases](#8-building-phases)
9. [Environment & Config](#9-environment--config)
10. [Deployment](#10-deployment)
11. [Constraints & Guardrails](#11-constraints--guardrails)

---

## 1. Project Overview

**What it is:** A web app that lets a single user record their screen (with optional webcam overlay and microphone audio), saves recordings as MP4 files on the server's local filesystem, and provides a simple file browser to view and replay past recordings.

**What it is NOT (out of scope for MVP):**
- No cloud upload or shareable links
- No video trimming or editing
- No annotations or drawing tools
- No transcript or AI summary
- No authentication (single user, internal network only)
- No multi-user or team features

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast dev server, great MediaRecorder API support |
| **Styling** | Tailwind CSS v3 | Utility-first, no design system overhead |
| **Backend** | Node.js 20 + Express 5 | Lightweight, handles file I/O and uploads cleanly |
| **Video capture** | Browser `MediaRecorder API` + `getDisplayMedia()` | Native, no plugin needed |
| **Webcam overlay** | HTML5 Canvas compositing | Draws screen + webcam frames together |
| **Video encoding** | Browser → WebM · Server → MP4 via FFmpeg | Browser can't encode MP4 natively; FFmpeg converts |
| **Storage** | Local filesystem (`/recordings/`) | Local-first requirement |
| **Database** | SQLite via `better-sqlite3` | Zero-config, perfect for solo use |
| **File upload** | `multer` (multipart) or chunked fetch | Handles large video blobs reliably |
| **Packaging** | Docker + Nginx | Clean deployment, easy to point domain at |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (React + Vite)                                         │
│                                                                 │
│  ┌──────────────────┐    ┌───────────────────────────────────┐  │
│  │  Recording View  │    │  Library View                     │  │
│  │                  │    │                                   │  │
│  │  getDisplayMedia │    │  File browser (list from API)     │  │
│  │  getUserMedia    │    │  <video> playback                 │  │
│  │  Canvas composer │    │  Delete / rename                  │  │
│  │  MediaRecorder   │    │                                   │  │
│  └────────┬─────────┘    └───────────────────────────────────┘  │
│           │  POST /api/upload (multipart blob)                  │
└───────────┼─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Express Server (Node.js)                                       │
│                                                                 │
│  POST /api/upload     → multer → save .webm → FFmpeg → .mp4    │
│  GET  /api/recordings → read SQLite → return list              │
│  GET  /api/recordings/:id → stream .mp4 file                   │
│  DELETE /api/recordings/:id → delete file + DB row             │
│  PATCH /api/recordings/:id → update title in DB                │
│                                                                 │
│  ┌────────────┐   ┌──────────────┐   ┌─────────────────────┐  │
│  │  SQLite DB │   │  FFmpeg CLI  │   │  /recordings/ folder│  │
│  │ (metadata) │   │  (WebM→MP4) │   │  (raw .mp4 files)  │  │
│  └────────────┘   └──────────────┘   └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Nginx reverse proxy                                            │
│  loom.example.com → localhost:3000                              │
└─────────────────────────────────────────────────────────────────┘
```

### Recording Flow (step by step)

1. User clicks **Start Recording** in the browser
2. Browser prompts for screen share via `getDisplayMedia()`
3. Browser optionally activates webcam via `getUserMedia()`
4. A `<canvas>` composites the screen feed + webcam PiP overlay at 30fps
5. `MediaRecorder` captures the canvas stream + mic audio as a `WebM` blob
6. On **Stop Recording**, the blob is `POST`ed to `/api/upload`
7. Server saves the raw `.webm` to a temp path, then runs:
   ```
   ffmpeg -i input.webm -c:v libx264 -c:a aac output.mp4
   ```
8. Server writes a metadata row to SQLite (`id`, `title`, `filename`, `duration`, `size`, `created_at`)
9. Frontend navigates to the Library view and shows the new recording

---

## 4. Folder Structure

```
screendeck/
├── client/                          # React frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── RecordingControls.jsx   # Start/stop/cancel bar
│   │   │   ├── WebcamOverlay.jsx       # PiP webcam preview
│   │   │   ├── RecordingCard.jsx       # Card in library grid
│   │   │   ├── VideoPlayer.jsx         # Full-screen player modal
│   │   │   └── EmptyState.jsx          # Empty library message
│   │   ├── hooks/
│   │   │   ├── useScreenRecorder.js    # Core MediaRecorder logic
│   │   │   ├── useWebcam.js            # Webcam stream management
│   │   │   └── useRecordings.js        # Fetch/delete/rename API calls
│   │   ├── pages/
│   │   │   ├── RecordPage.jsx          # /record
│   │   │   └── LibraryPage.jsx         # / (home)
│   │   ├── utils/
│   │   │   ├── canvasCompositor.js     # Screen + webcam canvas merge
│   │   │   ├── formatters.js           # Duration, file size display
│   │   │   └── api.js                  # Fetch wrapper for all API calls
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── recordings.js          # All /api/recordings routes
│   │   ├── middleware/
│   │   │   └── upload.js              # multer config
│   │   ├── services/
│   │   │   ├── ffmpeg.js              # FFmpeg WebM→MP4 conversion
│   │   │   └── db.js                  # SQLite connection + queries
│   │   └── index.js                   # Express app entry point
│   └── package.json
│
├── recordings/                      # MP4 files live here (gitignored)
├── tmp/                             # Temp WebM uploads (gitignored)
├── nginx/
│   └── screendeck.conf              # Nginx site config
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

## 5. Data Model

### SQLite — `recordings` table

```sql
CREATE TABLE recordings (
  id          TEXT PRIMARY KEY,          -- UUID v4
  title       TEXT NOT NULL,             -- Default: "Recording YYYY-MM-DD HH:MM"
  filename    TEXT NOT NULL UNIQUE,      -- e.g. "rec_1720000000.mp4"
  duration    INTEGER,                   -- Seconds (nullable until FFmpeg completes)
  size_bytes  INTEGER,                   -- File size in bytes
  has_webcam  INTEGER NOT NULL DEFAULT 0, -- Boolean (0/1)
  created_at  TEXT NOT NULL              -- ISO 8601 datetime
);
```

---

## 6. API Contract

All routes are prefixed `/api`.

### `POST /api/upload`
Upload a raw WebM blob after recording stops.

**Request:** `multipart/form-data`
```
field: video (File, .webm)
field: has_webcam (string "true"|"false")
field: duration (string, seconds)
```

**Response `202 Accepted`:**
```json
{
  "id": "uuid",
  "status": "processing"
}
```

**Response `200 OK`** (polling or webhook alternative):
```json
{
  "id": "uuid",
  "title": "Recording 2026-06-07 14:32",
  "filename": "rec_1749300720.mp4",
  "duration": 47,
  "size_bytes": 18204821,
  "has_webcam": true,
  "created_at": "2026-06-07T14:32:00Z"
}
```

---

### `GET /api/recordings`
Returns all recordings, newest first.

**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "title": "Recording 2026-06-07 14:32",
    "filename": "rec_1749300720.mp4",
    "duration": 47,
    "size_bytes": 18204821,
    "has_webcam": true,
    "created_at": "2026-06-07T14:32:00Z"
  }
]
```

---

### `GET /api/recordings/:id/stream`
Streams the MP4 file with range request support (required for `<video>` seeking).

**Headers supported:** `Range: bytes=0-`
**Response:** `206 Partial Content` with video/mp4 content type

---

### `PATCH /api/recordings/:id`
Rename a recording.

**Request body:**
```json
{ "title": "New Title" }
```
**Response `200 OK`:** Updated recording object

---

### `DELETE /api/recordings/:id`
Delete the recording (DB row + MP4 file).

**Response `204 No Content`**

---

### `GET /api/recordings/:id/status`
Poll processing status while FFmpeg runs.

**Response:**
```json
{ "id": "uuid", "status": "processing" | "ready" | "error" }
```

---

## 7. Frontend Screens & Components

### Screen 1 — Library (`/`)

```
┌──────────────────────────────────────────────────────┐
│  🎬 ScreenDeck                      [+ New Recording] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ thumbnail│  │ thumbnail│  │ thumbnail│           │
│  │          │  │          │  │          │           │
│  │ 0:47     │  │ 1:23     │  │ 0:12     │           │
│  ├──────────┤  ├──────────┤  ├──────────┤           │
│  │ Title    │  │ Title    │  │ Title    │           │
│  │ Jun 7    │  │ Jun 6    │  │ Jun 5    │           │
│  │ 17.4 MB  │  │ 32.1 MB  │  │ 4.2 MB   │           │
│  │ [▶][✏️][🗑]│  │ [▶][✏️][🗑]│  │ [▶][✏️][🗑]│           │
│  └──────────┘  └──────────┘  └──────────┘           │
└──────────────────────────────────────────────────────┘
```

### Screen 2 — Record (`/record`)

```
┌──────────────────────────────────────────────────────┐
│  ← Back to Library                                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│   ┌─────────────────────────────────────────────┐   │
│   │                                             │   │
│   │         Screen preview (canvas)             │   │
│   │                                   ┌───────┐ │   │
│   │                                   │  cam  │ │   │
│   │                                   └───────┘ │   │
│   └─────────────────────────────────────────────┘   │
│                                                      │
│   [Webcam ON/OFF]   ● 00:01:23   [■ Stop Recording] │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Screen 3 — Video Player (modal overlay)

- Full-screen modal on top of Library
- Native `<video controls>` element
- Title (editable inline)
- Duration + file size metadata
- Download button
- Close (ESC or ✕)

---

## 8. Building Phases

> Each phase is independently shippable. Complete all checklist items before moving to the next phase.

---

### Phase 1 — Project Scaffold & Server Foundation

**Goal:** Bare project running locally with a working Express server.

- [ ] Initialise monorepo root with `package.json` (workspaces: client, server)
- [ ] Scaffold `server/` with Express 5 + `better-sqlite3` + `multer` + `uuid`
- [ ] Create SQLite DB and run `CREATE TABLE recordings` migration on startup
- [ ] Implement `GET /api/recordings` returning empty array
- [ ] Scaffold `client/` with `npm create vite@latest` (React + JS template)
- [ ] Install and configure Tailwind CSS in the client
- [ ] Add Vite proxy: `/api` → `http://localhost:3000` in `vite.config.js`
- [ ] Verify: `npm run dev` starts both client (5173) and server (3000)
- [ ] Add `.env.example` with `PORT`, `RECORDINGS_DIR`, `TMP_DIR`, `DB_PATH`
- [ ] Add `recordings/` and `tmp/` to `.gitignore`

---

### Phase 2 — Screen + Webcam Capture

**Goal:** Browser successfully captures screen and webcam and composites them on a canvas.

- [ ] Implement `useScreenRecorder.js` hook:
  - [ ] `startCapture()` calls `navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })`
  - [ ] Returns a `MediaStream` and `stop()` function
  - [ ] Handle user cancellation (when user dismisses the browser dialog)
- [ ] Implement `useWebcam.js` hook:
  - [ ] `startWebcam()` calls `getUserMedia({ video: true, audio: false })`
  - [ ] `stopWebcam()` releases the stream
  - [ ] Expose `enabled` toggle state
- [ ] Implement `canvasCompositor.js`:
  - [ ] Creates an offscreen `<canvas>` at screen resolution
  - [ ] Uses `requestAnimationFrame` loop to draw screen frame, then webcam PiP (bottom-right, 20% width, rounded rect)
  - [ ] Exports `startCompositing(screenStream, webcamStream, canvas)` and `stop()`
- [ ] Implement `useScreenRecorder.js` mic capture:
  - [ ] `getUserMedia({ audio: true, video: false })` for microphone
  - [ ] Mix mic track into the final `MediaStream` passed to `MediaRecorder`
- [ ] Build `RecordPage.jsx`:
  - [ ] Show canvas preview live
  - [ ] Webcam toggle button (shows/hides PiP)
  - [ ] Recording timer (updates every second while recording)
- [ ] Verify: screen + webcam visible in canvas preview, mic input detected

---

### Phase 3 — Record, Upload & Convert

**Goal:** Full record → upload → FFmpeg → MP4 pipeline working end to end.

- [ ] Add `MediaRecorder` to `useScreenRecorder.js`:
  - [ ] Record canvas stream + mic as `video/webm;codecs=vp9,opus`
  - [ ] Collect `ondataavailable` chunks into array
  - [ ] On `onstop`, assemble `Blob` and call `uploadBlob(blob)`
- [ ] Implement `uploadBlob()` in `utils/api.js`:
  - [ ] POST `FormData` with `video` file, `has_webcam`, `duration` to `/api/upload`
  - [ ] Show upload progress (use `XMLHttpRequest` with `onprogress`)
- [ ] Implement `POST /api/upload` on server:
  - [ ] `multer` saves `.webm` to `tmp/`
  - [ ] Generate UUID, build output filename `rec_<timestamp>.mp4`
  - [ ] Insert row in SQLite with `status = "processing"`
  - [ ] Respond `202` immediately (non-blocking)
  - [ ] Run FFmpeg conversion asynchronously:
    ```
    ffmpeg -i input.webm -c:v libx264 -preset fast -crf 22 -c:a aac -movflags +faststart output.mp4
    ```
  - [ ] On FFmpeg success: update SQLite row with size, duration, `status = "ready"`, delete `.webm`
  - [ ] On FFmpeg error: set `status = "error"` in DB
- [ ] Implement `GET /api/recordings/:id/status` for polling
- [ ] Frontend polls status every 2s after upload until `ready` or `error`
- [ ] On `ready`, navigate to Library and highlight new recording
- [ ] Verify: full flow — record 10s → stop → upload → MP4 appears in library

---

### Phase 4 — Library & Playback

**Goal:** All recordings browsable and playable in the UI.

- [ ] Implement `GET /api/recordings` (newest first, all fields)
- [ ] Implement `GET /api/recordings/:id/stream` with byte-range support:
  - [ ] Use `fs.stat` + `res.setHeader('Content-Type', 'video/mp4')`
  - [ ] Parse `Range` header and respond with `206 Partial Content`
- [ ] Build `useRecordings.js` hook:
  - [ ] `fetchAll()` on mount, returns list
  - [ ] `deleteRecording(id)` calls `DELETE /api/recordings/:id`
  - [ ] `renameRecording(id, title)` calls `PATCH /api/recordings/:id`
- [ ] Build `LibraryPage.jsx`:
  - [ ] Responsive grid (3 cols desktop, 2 cols tablet, 1 col mobile)
  - [ ] `RecordingCard` for each recording with: title, date, duration, file size, webcam badge
  - [ ] Loading skeleton while fetching
  - [ ] `EmptyState` component when list is empty
- [ ] Build `RecordingCard.jsx`:
  - [ ] Inline rename on title click (contentEditable or input toggle)
  - [ ] Play button → opens `VideoPlayer` modal
  - [ ] Delete button → confirmation dialog → delete
- [ ] Build `VideoPlayer.jsx`:
  - [ ] Full-screen overlay modal
  - [ ] `<video controls autoPlay>` with `/api/recordings/:id/stream` as src
  - [ ] Title, date, duration, size display
  - [ ] Download button (`<a download href="...">`)
  - [ ] Close on ESC keypress or backdrop click
- [ ] Verify: recordings list loads, videos play and seek correctly, rename and delete work

---

### Phase 5 — Polish & Error Handling

**Goal:** App feels solid and handles edge cases gracefully.

- [ ] Show error toast if screen capture permission is denied
- [ ] Show error toast if microphone permission is denied (and allow recording without mic)
- [ ] Handle FFmpeg conversion failure: show error badge on card, allow deletion
- [ ] Show upload progress bar during large file uploads
- [ ] Prevent navigating away during an active recording (browser `beforeunload` warning)
- [ ] Add recording countdown (3-2-1) before capture starts
- [ ] Add `RecordingControls` bar with: timer, webcam toggle, cancel button, stop button
- [ ] Format durations as `MM:SS` and file sizes as `X.X MB`
- [ ] Add page title updates (`<title>Recording… | ScreenDeck`)
- [ ] Add favicon
- [ ] Mobile-responsive layout check (even if primarily desktop use)
- [ ] Verify: test all error paths manually

---

### Phase 6 — Deployment

**Goal:** App running on `loom.example.com` served by Nginx in Docker.

- [ ] Write `Dockerfile` (multi-stage: build client, copy dist into server static)
- [ ] Write `docker-compose.yml`:
  - [ ] `app` service: Node.js container, mounts `./recordings:/app/recordings`
  - [ ] `nginx` service: mounts `nginx/screendeck.conf`
  - [ ] Volume for `recordings/` persists across restarts
- [ ] Write `nginx/screendeck.conf`:
  - [ ] Proxy `/api` → `http://app:3000`
  - [ ] Serve React `dist/` as static files
  - [ ] Enable `client_max_body_size 2G` (for large recording uploads)
  - [ ] Add `proxy_read_timeout 300s` for FFmpeg processing
- [ ] Point DNS for `loom.example.com` to server IP
- [ ] (Optional) Add HTTPS with Let's Encrypt / Certbot
- [ ] Run `docker compose up -d` and verify full flow on domain
- [ ] Verify: record, upload, play — all working on `loom.example.com`

---

## 9. Environment & Config

Create a `.env` file at the project root based on `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=production

# Storage paths (absolute or relative to server/)
RECORDINGS_DIR=../recordings
TMP_DIR=../tmp
DB_PATH=../db/screendeck.db

# FFmpeg binary path (leave empty to use system PATH)
FFMPEG_PATH=

# Max upload size in bytes (default 2GB)
MAX_UPLOAD_SIZE=2147483648
```

---

## 10. Deployment

### Docker Compose (recommended)

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f app

# Stop
docker compose down
```

### Without Docker (dev/testing)

```bash
# Terminal 1 — backend
cd server && npm install && npm run dev

# Terminal 2 — frontend
cd client && npm install && npm run dev
```

### Prerequisites on the server

- Node.js 20+
- FFmpeg installed (`apt install ffmpeg` or binary in PATH)
- Nginx
- Docker + Docker Compose (if using containers)

---

## 11. Constraints & Guardrails

These are hard limits the implementation must respect:

| Constraint | Detail |
|---|---|
| **No auth** | No login, no sessions — this is a single-user internal tool |
| **No cloud** | All files stay on the server's local disk. No S3, no CDN. |
| **No edit features** | No trim, no cut, no annotations in MVP |
| **MP4 only** | Always convert WebM → MP4 server-side. Never expose .webm to the frontend. |
| **FFmpeg required** | Must be installed on the server. App should fail fast with a clear error if not found at startup. |
| **Range requests required** | The `/stream` endpoint must support `Range` headers or `<video>` seeking will not work. |
| **No in-memory blob storage** | Large recordings must go to disk via multer, not buffered in memory. |
| **Canvas compositing only** | The webcam PiP must be composited on the canvas before passing to MediaRecorder — not as a separate track — to guarantee a single video output. |
| **Graceful webcam denial** | If the user denies webcam, recording continues with screen + mic only. |

---

*End of implementation plan. Hand this document to Antigravity or Cursor and say: "Build this application according to the implementation plan."*
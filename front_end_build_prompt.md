# ScreenDeck — Frontend Build Prompt
> Paste this entire prompt into Antigravity or Cursor to scaffold the complete frontend.

---

## Your Assignment

Build the complete frontend for **ScreenDeck**, a self-hosted screen recording web app inspired by Loom. You are building the UI only — no backend, no real MediaRecorder integration yet. All API calls should be mocked with realistic fake data so the UI is fully navigable and testable in isolation.

When the real backend is ready, mocks will be swapped for real fetch calls with zero structural changes.

---

## Tech Stack

- **React 18** + **Vite** (JS, not TypeScript)
- **Tailwind CSS v3**
- **React Router v6** for navigation
- No component libraries (no shadcn, no MUI, no Radix) — build everything from scratch
- No state management library — React `useState` / `useContext` is sufficient

Bootstrap the project with:
```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom
```

---

## Design Direction

**Aesthetic:** Dark, focused, professional — like a tool built for power users. Think Linear meets Vercel dashboard. Not playful, not purple gradients.

**Color palette (use as CSS variables in `index.css`):**
```css
:root {
  --bg-base:       #0a0a0a;   /* near-black page background */
  --bg-surface:    #111111;   /* cards, panels */
  --bg-elevated:   #1a1a1a;   /* hover states, inputs */
  --border:        #222222;   /* subtle borders */
  --border-focus:  #444444;   /* focused/active borders */
  --text-primary:  #f0f0f0;   /* headings, labels */
  --text-secondary:#888888;   /* metadata, subtitles */
  --text-muted:    #444444;   /* placeholders, disabled */
  --accent:        #e8ff47;   /* electric yellow — primary CTA, highlights */
  --accent-dim:    #b8cc30;   /* accent hover state */
  --danger:        #ff4444;   /* delete, error states */
  --success:       #22c55e;   /* ready, processing complete */
  --processing:    #f59e0b;   /* encoding in progress */
}
```

**Typography:**
- Display / headings: `'DM Serif Display'` (Google Fonts)
- Body / UI: `'DM Mono'` (Google Fonts)
- Import both in `index.html`

**Visual character:**
- Thin `1px` borders everywhere using `var(--border)`
- No rounded corners on cards (sharp `border-radius: 0`) — clinical precision
- Subtle `box-shadow: 0 0 0 1px var(--border)` instead of drop shadows
- Accent yellow used sparingly — only on the primary action per screen
- Hover states: background lifts to `var(--bg-elevated)` + border to `var(--border-focus)`
- Smooth transitions: `transition: all 0.15s ease` on interactive elements

---

## File Structure to Create

```
client/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── RecordingCard.jsx
│   │   ├── VideoPlayer.jsx
│   │   ├── RecordingControls.jsx
│   │   ├── EmptyState.jsx
│   │   ├── StatusBadge.jsx
│   │   └── ConfirmDialog.jsx
│   ├── hooks/
│   │   ├── useRecordings.js       ← mocked
│   │   ├── useScreenRecorder.js   ← mocked/stubbed
│   │   └── useWebcam.js           ← mocked/stubbed
│   ├── pages/
│   │   ├── LibraryPage.jsx
│   │   └── RecordPage.jsx
│   ├── utils/
│   │   ├── api.js                 ← all fetch calls (mocked for now)
│   │   ├── formatters.js
│   │   └── mockData.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── tailwind.config.js
```

---

## Mock Data

Create `src/utils/mockData.js` with realistic fake recordings:

```js
export const MOCK_RECORDINGS = [
  {
    id: "rec-001",
    title: "Onboarding flow walkthrough",
    filename: "rec_1749300720.mp4",
    duration: 127,        // seconds
    size_bytes: 34521088, // ~33 MB
    has_webcam: true,
    status: "ready",
    created_at: "2026-06-07T14:32:00Z"
  },
  {
    id: "rec-002",
    title: "API integration demo",
    filename: "rec_1749214320.mp4",
    duration: 243,
    size_bytes: 67108864,
    has_webcam: false,
    status: "ready",
    created_at: "2026-06-06T09:15:00Z"
  },
  {
    id: "rec-003",
    title: "Recording 2026-06-05 18:44",
    filename: "rec_1749127920.mp4",
    duration: 48,
    size_bytes: 12582912,
    has_webcam: true,
    status: "ready",
    created_at: "2026-06-05T18:44:00Z"
  },
  {
    id: "rec-004",
    title: "Bug report — checkout button",
    filename: "rec_1749041520.mp4",
    duration: 19,
    size_bytes: 5242880,
    has_webcam: false,
    status: "processing",
    created_at: "2026-06-04T11:00:00Z"
  },
  {
    id: "rec-005",
    title: "Dashboard redesign review",
    filename: "rec_1748955120.mp4",
    duration: 391,
    size_bytes: 104857600,
    has_webcam: true,
    status: "ready",
    created_at: "2026-06-03T16:20:00Z"
  }
];
```

---

## Mock Hooks & API

### `src/utils/api.js`
All functions return `Promise` resolving after a short artificial delay (`setTimeout 300ms`) to simulate network latency. Mark each with a `// TODO: replace with real fetch` comment.

```js
import { MOCK_RECORDINGS } from './mockData.js';

let recordings = [...MOCK_RECORDINGS];

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

export async function fetchRecordings() {
  await delay();
  return [...recordings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function deleteRecording(id) {
  await delay();
  recordings = recordings.filter(r => r.id !== id);
}

export async function renameRecording(id, title) {
  await delay();
  recordings = recordings.map(r => r.id === id ? { ...r, title } : r);
  return recordings.find(r => r.id === id);
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
    created_at: new Date().toISOString()
  };
  recordings = [newRec, ...recordings];
  return newRec;
}
```

### `src/hooks/useRecordings.js`
Wraps `api.js`. Exposes: `{ recordings, loading, error, deleteRecording, renameRecording, refetch }`.

### `src/hooks/useScreenRecorder.js`
**Stub only** — do not call real browser APIs yet. Exposes a fake state machine:
- `status`: `'idle' | 'countdown' | 'recording' | 'uploading' | 'done'`
- `elapsedSeconds`: increments from 0 while `status === 'recording'`
- `startRecording()`: sets status to `'countdown'`, then after 3s → `'recording'`
- `stopRecording()`: sets status to `'uploading'`, simulates 2s delay, then `'done'`
- `cancelRecording()`: resets to `'idle'`
- Mark with `// TODO: wire up real MediaRecorder, getDisplayMedia, canvas compositor`

### `src/hooks/useWebcam.js`
**Stub only**. Exposes: `{ webcamEnabled, toggleWebcam }` — just a boolean toggle.

---

## Pages & Components — Detailed Specs

### `LibraryPage.jsx` — route `/`

Layout:
```
┌──────────────────────────────────────────────────────────────────┐
│  SCREENDECK                               [● Start Recording]    │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  5 recordings                                                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ grey rect    │  │ grey rect    │  │ grey rect    │           │
│  │ (thumbnail   │  │              │  │ PROCESSING…  │           │
│  │ placeholder) │  │              │  │              │           │
│  │  ● WEBCAM    │  │              │  │              │           │
│  │         0:47 │  │         4:03 │  │         0:19 │           │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤           │
│  │ Onboarding.. │  │ Dashboard... │  │ Bug report.. │           │
│  │ Jun 7 · 33MB │  │ Jun 3 · 99MB │  │ Jun 4 · 5MB  │           │
│  │  [▶] [✏] [🗑] │  │  [▶] [✏] [🗑] │  │  [▶] [✏] [🗑] │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

Details:
- Header: `SCREENDECK` in DM Serif Display, uppercase tracking. `[● Start Recording]` button in accent yellow on the right. The `●` pulses with a CSS animation.
- Recording count: `N recordings` in muted text below the header rule
- Grid: 3 columns on desktop (`≥1024px`), 2 on tablet (`≥640px`), 1 on mobile
- Loading state: show 6 skeleton cards (animated shimmer) while fetching
- Empty state: `EmptyState` component (see below)

### `RecordingCard.jsx`

Thumbnail area (16:9 ratio):
- Background: `var(--bg-elevated)` with a subtle diagonal stripe pattern (CSS `repeating-linear-gradient`)
- If `has_webcam`: show a small `● WEBCAM` badge top-left (accent yellow dot + text)
- If `status === 'processing'`: show a pulsing `ENCODING…` overlay with an amber spinner
- Duration: bottom-right corner, monospace, small
- On hover: show a play button overlay (▶) centered, with a semi-transparent dark backdrop

Card footer:
- Title: truncated with ellipsis if too long, editable on click (turns into an `<input>`, saves on blur/Enter, cancels on Escape)
- Metadata line: `Jun 7 · 33 MB` in muted text
- Action row: three icon buttons — Play (▶), Rename (✏), Delete (🗑)
  - Delete: triggers `ConfirmDialog` before calling `deleteRecording`
  - Play: opens `VideoPlayer` modal

### `EmptyState.jsx`

Centered in the page:
```
        ⬛
  No recordings yet.
  Hit record to make your first one.
       [● Start Recording]
```
The icon is a large `◼` in muted color. Clean, spare.

### `RecordPage.jsx` — route `/record`

Full-page layout:

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Library                                      SCREENDECK       │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │                  [screen preview area]                     │  │
│  │            (dark placeholder with dashed border)           │  │
│  │                                               ┌──────────┐ │  │
│  │                                               │ webcam   │ │  │
│  │                                               │ preview  │ │  │
│  │                                               └──────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│         [WEBCAM ON/OFF]   ●● 00:01:23   [■ STOP]                │
│                                                                  │
│  ── Idle ─────────────────────────────────────────────────────── │
│  Select a screen to share, then press Start.                     │
│                        [▶ START RECORDING]                       │
└──────────────────────────────────────────────────────────────────┘
```

States to implement visually (driven by `useScreenRecorder` stub):

**`idle`:**
- Preview area: dark placeholder, dashed border, centered text "Your screen will appear here"
- Bottom: prominent `[▶ START RECORDING]` button in accent yellow
- Webcam toggle visible but greyed out

**`countdown`:**
- Preview area shows a large countdown number (3 → 2 → 1) centered, animating in/out
- Button changes to `[STARTING…]` disabled

**`recording`:**
- Preview area: dark placeholder with a red pulsing `● REC` indicator top-left
- Timer: `00:01:23` updating every second in monospace
- Controls: `[WEBCAM ON/OFF]` toggle + `[■ STOP RECORDING]` in danger red
- `[▶ START RECORDING]` button is hidden

**`uploading`:**
- Preview area: shows a progress message "Uploading & encoding…" with an animated progress bar
- All controls disabled

**`done`:**
- Show a success message: "✓ Recording saved" with a `[View in Library →]` link that navigates to `/`

### `RecordingControls.jsx`

The control bar rendered inside `RecordPage` during `recording` state:
- Left: webcam toggle (icon + label, toggles state from `useWebcam`)
- Center: `● REC` + elapsed timer
- Right: `■ STOP` button (danger red border, fills on hover)

### `VideoPlayer.jsx`

Full-screen modal (dark overlay `rgba(0,0,0,0.9)`):

```
┌──────────────────────────────────────────────────────────────────┐
│  ✕                                                               │
│                                                                  │
│           ┌─────────────────────────────────┐                   │
│           │                                 │                   │
│           │     <video controls>            │                   │
│           │     src: mock URL               │                   │
│           │                                 │                   │
│           └─────────────────────────────────┘                   │
│                                                                  │
│           Onboarding flow walkthrough                            │
│           Jun 7, 2026 · 2:07 · 33.0 MB                          │
│                                             [⬇ Download]        │
└──────────────────────────────────────────────────────────────────┘
```

Details:
- Closes on `Escape` key or clicking the backdrop
- Video `src` for mock: use a public domain sample MP4 (`https://www.w3schools.com/html/mov_bbb.mp4`) so the player actually works
- Title is displayed below the video in DM Serif Display
- Download button: `<a>` tag with `download` attribute
- Smooth fade-in animation on mount

### `StatusBadge.jsx`

A small inline badge component:
- `ready`: green dot + "READY" (hidden in normal use, only show in debug)
- `processing`: amber pulsing dot + "ENCODING"
- `error`: red dot + "ERROR"

### `ConfirmDialog.jsx`

Simple modal for delete confirmation:
- Title: "Delete recording?"
- Body: "This cannot be undone."
- Buttons: `[Cancel]` (ghost) and `[Delete]` (danger red fill)
- Closes on `Escape`

---

## `src/utils/formatters.js`

```js
export function formatDuration(seconds) {
  // Returns "0:47", "2:03", "1:05:12" (with hours if >= 3600)
}

export function formatFileSize(bytes) {
  // Returns "5.0 MB", "99.0 MB", "1.2 GB"
}

export function formatDate(isoString) {
  // Returns "Jun 7, 2026"
}
```

---

## `App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LibraryPage from './pages/LibraryPage';
import RecordPage from './pages/RecordPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/record" element={<RecordPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        accent: '#e8ff47',
      },
    },
  },
  plugins: [],
};
```

---

## `index.html` — Google Fonts

Add inside `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Serif+Display&display=swap" rel="stylesheet">
```

---

## `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
```

---

## Quality Checklist

> **Status: Complete** (verified 2026-06-06) — all UI-only deliverables implemented. Project lives at the repo root (not a `client/` subfolder). `npm run build` passes with zero errors.

Before considering this done, verify:

- [x] `npm run dev` starts with zero errors
- [x] Library page loads and shows all 5 mock recordings
- [x] Skeleton loading state appears briefly on mount
- [x] Clicking a card's play button opens the VideoPlayer modal
- [x] Video actually plays in the modal (using the sample MP4 URL)
- [x] VideoPlayer closes on `Escape` and backdrop click
- [x] Clicking a card's title puts it into inline edit mode; `Enter` saves, `Escape` cancels
- [x] Delete button shows the ConfirmDialog; confirming removes the card from the list
- [x] One card shows "ENCODING" state (rec-004 in mock data)
- [x] Navigating to `/record` shows the RecordPage
- [x] Clicking `[▶ START RECORDING]` triggers the 3-2-1 countdown
- [x] After countdown, timer starts counting up
- [x] Clicking `[■ STOP]` transitions to uploading, then done state
- [x] `[View in Library →]` navigates back to `/`
- [x] Webcam toggle in RecordPage changes its label/icon
- [x] Empty state shows if all recordings are deleted
- [x] Layout is responsive (check at 375px, 768px, 1280px widths)
- [x] No `console.error` warnings in browser devtools

---

## What NOT to Build

Do not implement any of the following in this phase:

- Real `getDisplayMedia()` or `getUserMedia()` calls
- Real `MediaRecorder` or canvas compositing
- Real file uploads to a server
- Any backend code
- Authentication or login
- Video editing or trimming features
- Thumbnail generation (use the CSS placeholder pattern)

All of that comes in later phases. This phase is **UI and interactions only**.
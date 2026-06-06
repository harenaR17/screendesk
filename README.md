# ScreenDeck

A self-hosted, local-first screen recording web app inspired by Loom.

## Prerequisites

- Node.js 22.4+ (uses the built-in `node:sqlite` module for metadata storage)
- npm 10+

## Getting started

```bash
# Install dependencies (client + server workspaces)
npm install

# Copy environment template
cp .env.example .env

# Start API server (:3000) and Vite dev server (:5173)
npm run dev
```

- **Library UI:** http://localhost:5173
- **API health:** http://localhost:3000/api/health
- **Recordings list:** http://localhost:3000/api/recordings

## Project structure

```
screendeck/
├── client/          # React + Vite frontend
├── server/          # Express 5 API + SQLite
├── recordings/      # MP4 files (gitignored, created at runtime)
├── tmp/             # Temp uploads (gitignored, created at runtime)
├── db/              # SQLite database (gitignored, created at runtime)
└── .env.example     # Environment template
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server concurrently |
| `npm run build` | Build client for production |
| `npm run start` | Run production API server |

See `screendesk_implementation_plan.md` for the full build roadmap.

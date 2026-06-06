import express from 'express';
import { config } from './config.js';
import { initDb } from './services/db.js';
import recordingsRouter from './routes/recordings.js';

initDb();

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/recordings', recordingsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`ScreenDeck API listening on http://localhost:${config.port}`);
});

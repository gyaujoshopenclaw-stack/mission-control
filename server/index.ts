import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import taskRoutes from './routes/tasks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.MC_PORT || '3333');

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', taskRoutes);

// Serve static frontend
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mission Control server running on http://localhost:${PORT}`);
});

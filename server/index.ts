import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import taskRoutes from './routes/tasks.js';
import upgradeRoutes from './routes/upgrades.js';
import { setBroadcast } from './services/taskStore.js';
import { setUpgradeBroadcast } from './services/upgradeStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.MC_PORT || '3333');

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', taskRoutes);
app.use('/api', upgradeRoutes);

// Serve static frontend
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Create HTTP server and WebSocket server
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Set up broadcast
const broadcastHandler = (event: { type: string; payload: unknown }) => {
  const msg = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(msg);
    }
  }
};
setBroadcast(broadcastHandler);
setUpgradeBroadcast(broadcastHandler);

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected', payload: { message: 'Mission Control WebSocket connected' } }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mission Control server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws`);
});

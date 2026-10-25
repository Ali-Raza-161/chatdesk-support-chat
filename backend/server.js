// ChatDesk backend: Express REST API + Socket.IO.
// Run:  npm install && npm start   (default port 3000)
// MongoDB is optional: without MONGODB_URI the in-memory store is used.
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { connect, seedDemoAdmin } = require('./db');
const { attachSocket } = require('./socket');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200' }));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'chatdesk-backend' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/conversations', require('./routes/conversations'));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200', methods: ['GET', 'POST'] } });
app.set('io', io);
attachSocket(io);

async function start() {
  await connect();
  await seedDemoAdmin();
  server.listen(PORT, () => console.log('[chatdesk] Backend listening on http://localhost:' + PORT));
}
if (require.main === module) start();
module.exports = { app, server, start };

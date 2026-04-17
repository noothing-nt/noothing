require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const axios      = require('axios');
const { connectDB, startReconnectInterval } = require('./config/db');
const socketHandler  = require('./socket/socketHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const messageRoutes = require('./routes/messages');
const roomRoutes    = require('./routes/rooms');

const app    = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout:  60000,
  pingInterval: 25000,
});

// ── Connect DB + start reconnect interval ─────────────
connectDB().then(() => {
  startReconnectInterval();
});

// ── Middleware ────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(generalLimiter);

// ── Health Ping Route ─────────────────────────────────
app.get('/ping', (_req, res) => {
  res.status(200).json({
    status:  'alive',
    app:     'Noothing',
    ts:      new Date().toISOString(),
    uptime:  `${Math.floor(process.uptime())}s`,
    db:      require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── Attach io ─────────────────────────────────────────
app.use((req, _res, next) => { req.io = io; next(); });

// ── API Routes ────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rooms',    roomRoutes);

// ── 404 ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

// ── Error Handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

// ── Socket ────────────────────────────────────────────
socketHandler(io);

// ── Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Noothing running on port ${PORT}`);
  console.log(`   ENV    : ${process.env.NODE_ENV}`);
  console.log(`   CLIENT : ${process.env.CLIENT_URL}`);
  console.log(`   PING   : ${process.env.BACKEND_URL}/ping\n`);

  // ── Self-ping every 10 minutes (keeps Render alive) ──
  if (process.env.BACKEND_URL) {
    setInterval(async () => {
      try {
        const res = await axios.get(`${process.env.BACKEND_URL}/ping`, {
          timeout: 8000,
        });
        console.log(`💓 Self-ping OK [${res.data.uptime}]`);
      } catch (err) {
        console.warn('💔 Self-ping failed:', err.message);
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    console.log('⏰ Self-ping interval started (10 min)');
  }
});

// ── Graceful shutdown ─────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM — shutting down gracefully');
  server.close(() => { console.log('Server closed'); process.exit(0); });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err?.message || err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err?.message || err);
});
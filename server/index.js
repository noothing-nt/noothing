require('dotenv').config();
const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const socketHandler = require('./socket/socketHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const messageRoutes = require('./routes/messages');
const adminRoutes   = require('./routes/admin');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── Store io on app ──────────────────────────────────────
app.set('io', io);

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(generalLimiter);

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin',    adminRoutes);

// ── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
  });
});

// ── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.',
  });
});

// ── Socket.io ────────────────────────────────────────────
socketHandler(io);

// ── Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Noothing V2.0 Beast running on port ${PORT}`);
  });
});

// ── Keep-alive (Render free tier) ───────────────────────
if (process.env.BACKEND_URL) {
  setInterval(() => {
    require('axios')
      .get(`${process.env.BACKEND_URL}/api/health`)
      .catch(() => {});
  }, 14 * 60 * 1000);
}

module.exports = { app, server, io };
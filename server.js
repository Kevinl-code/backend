const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');
const violationRoutes = require('./routes/violation'); // ✅ ADD

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ MAKE SOCKET AVAILABLE EVERYWHERE
app.set("io", io);

// Socket.IO base
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);
  socket.on('disconnect', () =>
    console.log('Client disconnected:', socket.id)
  );
});

/* =========================
   CORS (ANDROID SAFE)
========================= */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/* =========================
   HANDLE OPTIONS
========================= */
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/* =========================
   API ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/violation', violationRoutes); // ✅ ADD

/* =========================
   STATIC FILES
========================= */
app.use(express.static('../frontend'));

/* =========================
   LEADERBOARD BROADCAST
========================= */
app.get('/api/leaderboard', (req, res) => {
  io.emit('updateLeaderboard');
  res.json({ message: 'Leaderboard updated' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);

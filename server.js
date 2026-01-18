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

// ✅ MAKE IO AVAILABLE EVERYWHERE
app.set("io", io);

io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);
  socket.on('disconnect', () =>
    console.log('Client disconnected:', socket.id)
  );
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/* =========================
   API ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/violation', violationRoutes); // ✅ ADD

app.use(express.static('../frontend'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);

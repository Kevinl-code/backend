require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// ---------------- DATABASE ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// ---------------- AUTH ----------------
app.post("/api/register", async (req, res) => {
  const { role, name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      role, name, email, password: hash
    });
    res.json({ success: true });
  } catch {
    res.status(400).json({ success: false });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.json({ success: false });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({ success: true, token, role: user.role });
});

// ---------------- VIOLATION API ----------------
app.post("/api/violation", async (req, res) => {
  const { userId, reason } = req.body;

  await User.findByIdAndUpdate(userId, {
    isDisqualified: true
  });

  io.emit("violation", { userId, reason });
  res.json({ disqualified: true });
});

// ---------------- ADMIN OVERRIDE ----------------
app.post("/api/admin/allow", async (req, res) => {
  const { userId } = req.body;
  await User.findByIdAndUpdate(userId, { isDisqualified: false });
  io.emit("override", { userId });
  res.json({ restored: true });
});

// ---------------- SOCKET.IO ----------------
io.on("connection", socket => {
  console.log("Admin connected");

  socket.on("monitor", data => {
    io.emit("monitor-update", data);
  });
});

// ---------------- START ----------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log("Server running on", PORT)
);

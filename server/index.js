const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// State: Map<roomName, Map<socketId, { id, username, color }>>
const rooms = new Map();

// Predefined avatar colors for users
const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
  '#a855f7', '#06b6d4', '#f97316', '#84cc16',
];

function getUserColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getRoomUsers(room) {
  if (!rooms.has(room)) return [];
  return Array.from(rooms.get(room).values());
}

function getColorIndexForRoom(room) {
  if (!rooms.has(room)) return 0;
  return rooms.get(room).size;
}

io.on('connection', (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);
  let currentRoom = null;
  let currentUser = null;

  // ── JOIN ROOM ──────────────────────────────────────────────────────────────
  socket.on('user:join', ({ username, room }) => {
    if (!username || !room) return;

    currentRoom = room;
    const colorIndex = getColorIndexForRoom(room);
    currentUser = {
      id: socket.id,
      username: username.trim(),
      color: getUserColor(colorIndex),
    };

    socket.join(room);

    if (!rooms.has(room)) rooms.set(room, new Map());
    rooms.get(room).set(socket.id, currentUser);

    const users = getRoomUsers(room);
    console.log(`[ROOM:${room}] ${username} joined. Users: ${users.length}`);

    // Notify the joiner
    socket.emit('user:joined', {
      self: currentUser,
      users,
      message: `ยินดีต้อนรับสู่ห้อง "${room}"! 🎉`,
    });

    // Notify others
    socket.to(room).emit('user:joined', {
      self: null,
      users,
      message: `${username} เข้าร่วมห้องแชท`,
      joiner: currentUser,
    });
  });

  // ── SEND MESSAGE ──────────────────────────────────────────────────────────
  socket.on('message:send', ({ text, room }) => {
    if (!text || !room || !currentUser) return;

    const message = {
      id: uuidv4(),
      username: currentUser.username,
      color: currentUser.color,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Send to sender (self flag = true)
    socket.emit('message:receive', { ...message, self: true });
    // Send to others in room
    socket.to(room).emit('message:receive', { ...message, self: false });

    console.log(`[MSG:${room}] ${currentUser.username}: ${text.slice(0, 50)}`);
  });

  // ── TYPING ────────────────────────────────────────────────────────────────
  const roomTypers = new Map(); // Map<room, Map<socketId, username>>

  socket.on('typing:start', ({ room }) => {
    if (!currentUser || !room) return;
    if (!roomTypers.has(room)) roomTypers.set(room, new Map());
    roomTypers.get(room).set(socket.id, currentUser.username);

    const typers = Array.from(roomTypers.get(room).values());
    socket.to(room).emit('typing:update', { typers });
  });

  socket.on('typing:stop', ({ room }) => {
    if (!room) return;
    if (roomTypers.has(room)) {
      roomTypers.get(room).delete(socket.id);
      const typers = Array.from(roomTypers.get(room).values());
      socket.to(room).emit('typing:update', { typers });
    }
  });

  // ── DISCONNECT ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[-] Socket disconnected: ${socket.id}`);

    if (currentRoom && currentUser && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(socket.id);
      if (rooms.get(currentRoom).size === 0) {
        rooms.delete(currentRoom);
      }

      // Clean typing state
      if (roomTypers.has(currentRoom)) {
        roomTypers.get(currentRoom).delete(socket.id);
        const typers = Array.from(roomTypers.get(currentRoom).values());
        socket.to(currentRoom).emit('typing:update', { typers });
      }

      const users = getRoomUsers(currentRoom);
      socket.to(currentRoom).emit('user:left', {
        users,
        message: `${currentUser.username} ออกจากห้องแชท`,
        leaver: currentUser,
      });
    }
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Chat Server running on http://localhost:${PORT}`);
  console.log(`   Socket.io ready for connections\n`);
});

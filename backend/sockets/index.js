/**
 * sockets/index.js
 * Socket.io connection handler with JWT auth middleware.
 */
const { verifyToken } = require('../utils/token');
const User    = require('../models/User');
const Message = require('../models/Message');

const initSockets = (io) => {
  // ── Socket auth middleware ──────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = verifyToken(token);
      socket.user = await User.findById(decoded.id).select('-password');
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch (_) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 Connected: ${socket.user.name}`);

    socket.join(`user_${userId}`);
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit('user:online', { userId });

    socket.on('chat:join',    ({ room }) => socket.join(room));
    socket.on('chat:leave',   ({ room }) => socket.leave(room));

    socket.on('chat:message', async ({ room, content }) => {
      try {
        const msg = await Message.create({ room, sender: socket.user._id, content });
        await msg.populate('sender', 'name avatar');
        io.to(room).emit('chat:message', msg);
      } catch (_) {}
    });

    socket.on('chat:typing', ({ room, isTyping }) => {
      socket.to(room).emit('chat:typing', { userId, isTyping });
    });

    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user:offline', { userId });
    });
  });
};

module.exports = { initSockets };

const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('../models/User');
const Message = require('../models/Message');
const { cloudinary } = require('../config/cloudinary');
const {
  validateEncryptedPayload,
  sanitizeMessageText,
} = require('../utils/cryptoPayload');

const onlineUsers = new Map();

module.exports = (io) => {
  // ── Auth Middleware ──────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies.noothing_token;
      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Auth failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id,
    });

    socket.broadcast.emit('user:online', { userId });
    console.log(`🟢 ${socket.user.username} [${socket.id}]`);

    // ── Send Message ─────────────────────────────────────
    socket.on('message:send', async (data) => {
      try {
        const {
          recipientId,
          roomId,
          text,
          image,
          isViewOnce,
          encryptedPayload,
          tempId,
        } = data;

        const validPayload = validateEncryptedPayload(encryptedPayload);
        const safeText = sanitizeMessageText(text, validPayload);

        const messageData = {
          sender: userId,
          text: safeText,
          image: image || { url: '', publicId: '' },
          isViewOnce: !!isViewOnce,
          status: 'sent',
        };

        if (validPayload) messageData.encryptedPayload = validPayload;
        if (recipientId) messageData.recipient = recipientId;
        if (roomId) messageData.room = roomId;

        const message = await Message.create(messageData);
        await message.populate('sender', 'username avatar');

        const msgPayload = { ...message.toObject(), tempId };

        if (recipientId) {
          const recipientSocketId = onlineUsers.get(recipientId);
          if (recipientSocketId) {
            message.status = 'delivered';
            await message.save();
            msgPayload.status = 'delivered';

            io.to(recipientSocketId).emit('message:receive', msgPayload);
            io.to(recipientSocketId).emit('contact:update', {
              user: {
                _id: socket.user._id,
                username: socket.user.username,
                avatar: socket.user.avatar,
                isOnline: true,
              },
              lastMessage: msgPayload,
            });
          }
          socket.emit('message:sent', msgPayload);
        } else if (roomId) {
          socket.to(roomId).emit('message:receive', msgPayload);
          socket.emit('message:sent', msgPayload);
        }
      } catch (err) {
        console.error('message:send error:', err);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ── Typing ───────────────────────────────────────────
    socket.on('typing:start', ({ recipientId, roomId }) => {
      const payload = { senderId: userId, username: socket.user.username };
      if (recipientId) {
        const sid = onlineUsers.get(recipientId);
        if (sid) io.to(sid).emit('typing:start', payload);
      } else if (roomId) {
        socket.to(roomId).emit('typing:start', payload);
      }
    });

    socket.on('typing:stop', ({ recipientId, roomId }) => {
      const payload = { senderId: userId };
      if (recipientId) {
        const sid = onlineUsers.get(recipientId);
        if (sid) io.to(sid).emit('typing:stop', payload);
      } else if (roomId) {
        socket.to(roomId).emit('typing:stop', payload);
      }
    });

    // ── Read Receipts ────────────────────────────────────
    socket.on('messages:read', async ({ senderId, messageIds }) => {
      try {
        if (!Array.isArray(messageIds) || !messageIds.length) return;
        await Message.updateMany(
          { _id: { $in: messageIds }, status: { $ne: 'read' } },
          { status: 'read' }
        );
        const senderSid = onlineUsers.get(senderId);
        if (senderSid) {
          io.to(senderSid).emit('messages:read', { messageIds, readBy: userId });
        }
      } catch (err) {
        console.error('messages:read error:', err);
      }
    });

    // ── Delete Message ───────────────────────────────────
    socket.on('message:delete', async ({ messageId, recipientId, roomId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.sender.toString() !== userId) return;

        if (message.image?.publicId) {
          await cloudinary.uploader.destroy(message.image.publicId).catch(console.error);
        }

        message.isDeleted = true;
        message.text = '';
        message.image = { url: '', publicId: '' };
        await message.save();

        const payload = { messageId };
        if (recipientId) {
          const sid = onlineUsers.get(recipientId);
          if (sid) io.to(sid).emit('message:deleted', payload);
        } else if (roomId) {
          socket.to(roomId).emit('message:deleted', payload);
        }
        socket.emit('message:deleted', payload);
      } catch (err) {
        console.error('message:delete error:', err);
      }
    });

    // ── Edit Message ─────────────────────────────────────
    socket.on('message:edit', async ({ messageId, text, recipientId, roomId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.sender.toString() !== userId) return;

        message.text = (text || '').slice(0, 5000);
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        const payload = { messageId, text: message.text, editedAt: message.editedAt };
        if (recipientId) {
          const sid = onlineUsers.get(recipientId);
          if (sid) io.to(sid).emit('message:edited', payload);
        } else if (roomId) {
          socket.to(roomId).emit('message:edited', payload);
        }
        socket.emit('message:edited', payload);
      } catch (err) {
        console.error('message:edit error:', err);
      }
    });

    // ── View Once Destroy ────────────────────────────────
    socket.on('message:viewOnceDestroy', async ({ messageId, senderId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || !message.isViewOnce) return;

        if (message.image?.publicId) {
          await cloudinary.uploader.destroy(message.image.publicId).catch(console.error);
        }

        await Message.findByIdAndDelete(messageId);
        const senderSid = onlineUsers.get(senderId);
        if (senderSid) {
          io.to(senderSid).emit('message:viewOnceDestroyed', { messageId });
        }
        socket.emit('message:viewOnceDestroyed', { messageId });
      } catch (err) {
        console.error('viewOnceDestroy error:', err);
      }
    });

    // ── Call Invite Events ───────────────────────────────
    socket.on('call:invite', ({ recipientId, callRoomId, callType, callerName, callerAvatar }) => {
      const recipientSid = onlineUsers.get(recipientId);
      if (recipientSid) {
        io.to(recipientSid).emit('call:incoming', {
          callRoomId,
          callType,
          callerName,
          callerAvatar,
          callerId: userId,
        });
      }
    });

    socket.on('call:accept', ({ callRoomId, callerId }) => {
      const callerSid = onlineUsers.get(callerId);
      if (callerSid) {
        io.to(callerSid).emit('call:accepted', { callRoomId });
      }
    });

    socket.on('call:reject', ({ callerId }) => {
      const callerSid = onlineUsers.get(callerId);
      if (callerSid) {
        io.to(callerSid).emit('call:rejected', { by: socket.user.username });
      }
    });

    socket.on('call:end', ({ recipientId }) => {
      const recipientSid = onlineUsers.get(recipientId);
      if (recipientSid) {
        io.to(recipientSid).emit('call:ended', { by: socket.user.username });
      }
    });

    // ── Room Events ──────────────────────────────────────
    socket.on('room:join', (roomId) => {
      if (roomId) socket.join(roomId);
    });

    socket.on('room:leave', (roomId) => {
      if (roomId) socket.leave(roomId);
    });

    // ── Disconnect ───────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔴 ${socket.user.username} disconnected`);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: '',
      });
      socket.broadcast.emit('user:offline', { userId, lastSeen: new Date() });
    });
  });
};
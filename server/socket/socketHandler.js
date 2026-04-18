const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Message = require('../models/Message');
const Block   = require('../models/Block');
const Notification = require('../models/Notification');
const cookie  = require('cookie');

// ── Auth Middleware for Socket.io ────────────────────────
const socketAuth = async (socket, next) => {
  try {
    let token;

    // Try cookie first
    if (socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      token = cookies.noothing_token;
    }

    // Fallback to auth header
    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }

    if (!token) return next(new Error('Authentication required.'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      'username avatar isOnline isBanned isDeleted isDisabled blockedUsers'
    );

    if (!user || user.isBanned || user.isDeleted || user.isDisabled)
      return next(new Error('Account unavailable.'));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid token.'));
  }
};

module.exports = (io) => {
  io.use(socketAuth);

  // ── Online Users Map: userId -> Set<socketId> ────────
  const onlineUsers = new Map();

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 Connected: @${socket.user.username} [${socket.id}]`);

    // ── Register socket ──────────────────────────────────
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // Update DB
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date(),
    });

    // Join personal room for DMs
    socket.join(userId);

    // Broadcast online status (excluding blocked users)
    socket.broadcast.emit('user:online', { userId, isOnline: true });

    // ── SEND DM MESSAGE ──────────────────────────────────
    socket.on('message:send', async (data) => {
      try {
        const {
          recipientId, text, messageType = 'text',
          image, file, sticker, replyTo, isViewOnce,
        } = data;

        // Block check
        const blocked = await Block.findOne({
          $or: [
            { blocker: userId, blocked: recipientId },
            { blocker: recipientId, blocked: userId },
          ],
        });
        if (blocked) return socket.emit('error', { message: 'Cannot message blocked user.' });

        // Recipient exists?
        const recipient = await User.findById(recipientId);
        if (!recipient || recipient.isDeleted || recipient.isBanned)
          return socket.emit('error', { message: 'Recipient unavailable.' });

        const messageData = {
          sender:    userId,
          recipient: recipientId,
          messageType,
          status:    'sent',
        };

        if (text)      messageData.text      = text.trim().slice(0, 5000);
        if (image)     messageData.image     = image;
        if (file)      messageData.file      = file;
        if (sticker)   messageData.sticker   = sticker;
        if (isViewOnce) messageData.isViewOnce = true;

        if (replyTo?.messageId) {
          messageData.replyTo = {
            messageId:     replyTo.messageId,
            text:          replyTo.text || '',
            senderUsername: replyTo.senderUsername || '',
            messageType:   replyTo.messageType || 'text',
          };
        }

        const message = await Message.create(messageData);
        const populated = await message.populate('sender', 'username avatar');

        // Check if recipient is online in this chat
        const recipientSockets = onlineUsers.get(recipientId);
        const isDelivered = recipientSockets && recipientSockets.size > 0;

        if (isDelivered) {
          message.status = 'delivered';
          await message.save({ validateBeforeSave: false });
        }

        // Send to recipient's room
        io.to(recipientId).emit('message:receive', populated);

        // Send confirmation back to sender
        socket.emit('message:sent', populated);

        // Create notification if recipient not in this chat
        await Notification.create({
          recipient: recipientId,
          sender:    userId,
          type:      'new_message',
          message:   message._id,
          text:      text ? text.slice(0, 100) : `Sent a ${messageType}`,
          chatId:    userId,
        });

        // Emit notification to recipient
        io.to(recipientId).emit('notification:new', {
          senderId:   userId,
          username:   socket.user.username,
          avatar:     socket.user.avatar?.url,
          text:       text ? text.slice(0, 60) : `📎 ${messageType}`,
          messageId:  message._id,
          chatId:     userId,
          createdAt:  message.createdAt,
        });

        // Reorder contact list for both parties
        io.to(recipientId).emit('contacts:reorder', {
          userId,
          lastMessage: populated,
          timestamp:   message.createdAt,
        });
        socket.emit('contacts:reorder', {
          userId:      recipientId,
          lastMessage: populated,
          timestamp:   message.createdAt,
        });
      } catch (err) {
        console.error('message:send error:', err);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ── TYPING INDICATORS ────────────────────────────────
    socket.on('typing:start', ({ recipientId }) => {
      socket.to(recipientId).emit('typing:start', {
        userId,
        username: socket.user.username,
      });
    });

    socket.on('typing:stop', ({ recipientId }) => {
      socket.to(recipientId).emit('typing:stop', { userId });
    });

    // ── READ RECEIPTS ────────────────────────────────────
    socket.on('message:read', async ({ messageIds, senderId }) => {
      try {
        if (!messageIds?.length) return;

        await Message.updateMany(
          { _id: { $in: messageIds }, recipient: userId, status: { $ne: 'read' } },
          { $set: { status: 'read' } }
        );

        // Notify original sender
        io.to(senderId).emit('message:read', { messageIds, readBy: userId });
      } catch (err) {
        console.error('message:read error:', err);
      }
    });

    // ── REACTIONS ────────────────────────────────────────
    socket.on('reaction:add', async ({ messageId, emoji, recipientId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        const existingIdx = message.reactions.findIndex(
          (r) => r.userId.toString() === userId && r.emoji === emoji
        );

        if (existingIdx > -1) {
          message.reactions.splice(existingIdx, 1);
        } else {
          message.reactions = message.reactions.filter(
            (r) => r.userId.toString() !== userId
          );
          message.reactions.push({ emoji, userId, username: socket.user.username });
        }

        await message.save({ validateBeforeSave: false });

        const reactionData = { messageId, reactions: message.reactions };
        socket.emit('reaction:updated', reactionData);
        io.to(recipientId).emit('reaction:updated', reactionData);
      } catch (err) {
        console.error('reaction:add error:', err);
      }
    });

    // ── DELETE MESSAGE ───────────────────────────────────
    socket.on('message:delete', async ({ messageId, recipientId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.sender.toString() !== userId) return;

        message.isDeleted = true;
        message.text = '';
        message.image = { url: '', publicId: '' };
        message.file  = {};
        await message.save({ validateBeforeSave: false });

        const payload = { messageId };
        socket.emit('message:deleted', payload);
        io.to(recipientId).emit('message:deleted', payload);
      } catch (err) {
        console.error('message:delete error:', err);
      }
    });

    // ── EDIT MESSAGE ─────────────────────────────────────
    socket.on('message:edit', async ({ messageId, text, recipientId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.sender.toString() !== userId || message.isDeleted) return;

        message.text     = text.trim().slice(0, 5000);
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save({ validateBeforeSave: false });

        const payload = { messageId, text: message.text, editedAt: message.editedAt };
        socket.emit('message:edited', payload);
        io.to(recipientId).emit('message:edited', payload);
      } catch (err) {
        console.error('message:edit error:', err);
      }
    });

    // ── CALL EVENTS (ZegoCloud) ──────────────────────────
    socket.on('call:initiate', ({ recipientId, callType }) => {
      io.to(recipientId).emit('call:incoming', {
        callerId:     userId,
        callerName:   socket.user.username,
        callerAvatar: socket.user.avatar?.url,
        callType,
        roomId:       `${userId}_${recipientId}_${Date.now()}`,
      });
    });

    socket.on('call:accepted', ({ callerId, roomId }) => {
      io.to(callerId).emit('call:accepted', { roomId });
    });

    socket.on('call:rejected', async ({ callerId, callType }) => {
      io.to(callerId).emit('call:rejected', { rejectedBy: userId });

      // Inject missed call system message
      try {
        const msgType = callType === 'video' ? 'missed_video' : 'missed_call';
        const msg = await Message.create({
          sender:    userId,
          recipient: callerId,
          messageType: msgType,
          text: callType === 'video' ? '📹 Missed video call' : '📞 Missed call',
          status: 'delivered',
        });

        const populated = await msg.populate('sender', 'username avatar');
        io.to(callerId).emit('message:receive', populated);
        socket.emit('message:sent', populated);
      } catch (err) {
        console.error('Missed call message error:', err);
      }
    });

    socket.on('call:ended', ({ recipientId }) => {
      io.to(recipientId).emit('call:ended', { endedBy: userId });
    });

    socket.on('call:missed', async ({ recipientId, callType }) => {
      try {
        const msgType = callType === 'video' ? 'missed_video' : 'missed_call';
        const msg = await Message.create({
          sender:    userId,
          recipient: recipientId,
          messageType: msgType,
          text: callType === 'video' ? '📹 Missed video call' : '📞 Missed call',
          status: 'delivered',
        });
        const populated = await msg.populate('sender', 'username avatar');
        io.to(recipientId).emit('message:receive', populated);
        socket.emit('message:sent', populated);
      } catch (err) {
        console.error('call:missed error:', err);
      }
    });

    // ── BLOCK USER ───────────────────────────────────────
    socket.on('user:block', ({ targetUserId }) => {
      // Sever real-time stream
      io.to(targetUserId).emit('user:blocked_by', { blockerId: userId });
    });

    // ── DISCONNECT ───────────────────────────────────────
    socket.on('disconnect', async () => {
      try {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);
            const now = new Date();
            await User.findByIdAndUpdate(userId, {
              isOnline: false,
              lastSeen: now,
              socketId: '',
            });
            socket.broadcast.emit('user:offline', { userId, lastSeen: now });
          }
        }
        console.log(`🔌 Disconnected: @${socket.user.username}`);
      } catch (err) {
        console.error('Disconnect error:', err);
      }
    });
  });
};
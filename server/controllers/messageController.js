const Message      = require('../models/Message');
const Notification = require('../models/Notification');
const Block        = require('../models/Block');
const { cloudinary, uploadMessage } = require('../config/cloudinary');

// ── Get DM Messages ──────────────────────────────────────
exports.getDMMessages = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 50;
    const skip  = (page - 1) * limit;

    // Check block
    const isBlocked = await Block.findOne({
      $or: [
        { blocker: req.user._id, blocked: req.params.userId },
        { blocker: req.params.userId, blocked: req.user._id },
      ],
    });

    if (isBlocked)
      return res.status(403).json({ message: 'Cannot view messages from a blocked user.' });

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .populate('replyTo.messageId', 'text sender messageType')
      .lean();

    // Mark delivered
    await Message.updateMany(
      { recipient: req.user._id, sender: req.params.userId, status: 'sent' },
      { $set: { status: 'delivered' } }
    );

    // Mark notifications read
    await Notification.updateMany(
      { recipient: req.user._id, sender: req.params.userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages.reverse());
  } catch (err) {
    console.error('getDMMessages error:', err);
    res.status(500).json({ message: 'Error fetching messages.' });
  }
};

// ── Get Room Messages ────────────────────────────────────
exports.getRoomMessages = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 50;
    const skip  = (page - 1) * limit;

    const messages = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .lean();

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Error fetching room messages.' });
  }
};

// ── Upload Image ─────────────────────────────────────────
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided.' });
    res.json({ url: req.file.path, publicId: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: 'Image upload failed.' });
  }
};

// ── Upload File ──────────────────────────────────────────
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided.' });
    res.json({
      url:      req.file.path,
      publicId: req.file.filename,
      name:     req.file.originalname,
      size:     req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (err) {
    res.status(500).json({ message: 'File upload failed.' });
  }
};

// ── Delete Message ───────────────────────────────────────
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found.' });
    if (message.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized.' });

    if (message.image?.publicId)
      await cloudinary.uploader.destroy(message.image.publicId).catch(console.error);

    if (message.file?.publicId)
      await cloudinary.uploader.destroy(message.file.publicId).catch(console.error);

    message.isDeleted = true;
    message.text = '';
    message.image = { url: '', publicId: '' };
    message.file  = { url: '', publicId: '', name: '', size: 0, mimeType: '' };
    message.encryptedPayload = undefined;
    await message.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed.' });
  }
};

// ── Edit Message ─────────────────────────────────────────
exports.editMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Text is required.' });

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found.' });
    if (message.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized.' });
    if (message.isDeleted)
      return res.status(400).json({ message: 'Cannot edit deleted message.' });

    message.text     = text.trim().slice(0, 5000);
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({ message });
  } catch (err) {
    res.status(500).json({ message: 'Edit failed.' });
  }
};

// ── Add Reaction ─────────────────────────────────────────
exports.addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: 'Emoji required.' });

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found.' });

    // Toggle reaction
    const existingIdx = message.reactions.findIndex(
      (r) => r.userId.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingIdx > -1) {
      message.reactions.splice(existingIdx, 1);
    } else {
      // Remove any other reaction from this user first
      message.reactions = message.reactions.filter(
        (r) => r.userId.toString() !== req.user._id.toString()
      );
      message.reactions.push({
        emoji,
        userId:   req.user._id,
        username: req.user.username,
      });
    }

    await message.save();
    res.json({ reactions: message.reactions });
  } catch (err) {
    res.status(500).json({ message: 'Reaction failed.' });
  }
};

// ── View Once Destroy ────────────────────────────────────
exports.destroyViewOnce = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message || !message.isViewOnce)
      return res.status(404).json({ message: 'Message not found.' });

    if (message.image?.publicId)
      await cloudinary.uploader.destroy(message.image.publicId).catch(console.error);

    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'View-once destroy failed.' });
  }
};

// ── Get Notifications ────────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id, isRead: false,
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

// ── Mark Notifications Read ──────────────────────────────
exports.markNotificationsRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const query = { recipient: req.user._id, isRead: false };
    if (chatId) query['$or'] = [{ sender: chatId }, { chatId }];

    await Notification.updateMany(query, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications read.' });
  }
};
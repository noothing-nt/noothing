const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji:  { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  room:      { type: mongoose.Schema.Types.ObjectId, ref: 'Room', index: true },

  // ── Content ─────────────────────────────────────────
  text:      { type: String, default: '', maxlength: 5000 },
  messageType: {
    type: String,
    enum: ['text', 'image', 'sticker', 'file', 'system', 'missed_call', 'missed_video'],
    default: 'text',
  },

  // ── Media ───────────────────────────────────────────
  image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  file: {
    url:      { type: String, default: '' },
    publicId: { type: String, default: '' },
    name:     { type: String, default: '' },
    size:     { type: Number, default: 0 },
    mimeType: { type: String, default: '' },
  },
  sticker: { url: { type: String, default: '' }, pack: { type: String, default: '' } },

  // ── Threading ───────────────────────────────────────
  replyTo: {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    text:      { type: String, default: '' },
    senderUsername: { type: String, default: '' },
    messageType: { type: String, default: 'text' },
  },

  // ── Reactions ───────────────────────────────────────
  reactions: [reactionSchema],

  // ── Status ──────────────────────────────────────────
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  isDeleted:  { type: Boolean, default: false },
  isEdited:   { type: Boolean, default: false },
  editedAt:   { type: Date },
  isViewOnce: { type: Boolean, default: false },
  viewOnceViewed: { type: Boolean, default: false },

  // ── E2EE prep ───────────────────────────────────────
  encryptedPayload: {
    iv: String, ciphertext: String,
    algorithm: { type: String, default: 'NONE' },
  },

  // ── TTL (burner rooms) ──────────────────────────────
  expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
}, { timestamps: true });

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
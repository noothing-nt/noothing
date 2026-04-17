const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    index: true,
  },
  text: {
    type: String,
    default: '',
    maxlength: 5000,
  },
  // E2EE prep: store encrypted payload metadata
  encryptedPayload: {
    iv: String,        // Initialization vector
    ciphertext: String,
    algorithm: { type: String, default: 'AES-GCM' },
  },
  image: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  isViewOnce: { type: Boolean, default: false },
  viewOnceViewed: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  // TTL for burner rooms - set via application logic
  expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
}, { timestamps: true });

// Compound indexes for fast chat history retrieval
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
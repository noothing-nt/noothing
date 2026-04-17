const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  avatar: { type: String, default: '' },
  isBurner: { type: Boolean, default: false },
  inviteCode: {
    type: String,
    unique: true,
    default: () => uuidv4().slice(0, 10),
  },
  // TTL for burner rooms
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 },
  },
}, { timestamps: true });

roomSchema.index({ inviteCode: 1 });
roomSchema.index({ members: 1 });

module.exports = mongoose.model('Room', roomSchema);
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['new_message', 'missed_call', 'missed_video', 'reaction', 'system'],
    required: true,
  },
  message:   { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  text:      { type: String, default: '' },
  isRead:    { type: Boolean, default: false, index: true },
  chatId:    { type: mongoose.Schema.Types.ObjectId },
  isRoom:    { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
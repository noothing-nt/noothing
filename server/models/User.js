const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true,
    match: [/^[a-z0-9_.]+$/, 'Invalid username format'],
    minlength: 3, maxlength: 30,
  },
  password: { type: String, required: true, minlength: 6, select: false },
  email: {
    type: String, lowercase: true, trim: true,
    sparse: true, unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  avatar:   { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  bio:      { type: String, default: '', maxlength: 150 },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },

  // ── Identity & Access ───────────────────────────────
  isOnline:    { type: Boolean, default: false },
  lastSeen:    { type: Date, default: Date.now },
  socketId:    { type: String, default: '' },
  inviteCode:  { type: String, unique: true, sparse: true },
  acceptedTerms: { type: Boolean, required: true, default: false },

  // ── Ghost Protocol ──────────────────────────────────
  isSearchable: { type: Boolean, default: true },

  // ── Presence Masking ────────────────────────────────
  showLastSeen: { type: Boolean, default: true },

  // ── Lifecycle ───────────────────────────────────────
  isDisabled: { type: Boolean, default: false },
  isDeleted:  { type: Boolean, default: false },
  isBanned:   { type: Boolean, default: false },
  banReason:  { type: String, default: '' },
  deletedAt:  { type: Date },

  // ── Blocklist ───────────────────────────────────────
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // ── Multi-Account ───────────────────────────────────
  linkedAccounts: [{
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    avatar:   String,
  }],

  // ── Password Reset ──────────────────────────────────
  resetPasswordToken:  { type: String, select: false },
  resetPasswordExpiry: { type: Date,   select: false },

  // ── Security Q&A ───────────────────────────────────
  securityQuestion: { type: String, default: '' },
  securityAnswer:   { type: String, default: '', select: false },

  // ── Admin notes ─────────────────────────────────────
  adminNotes: { type: String, default: '' },
  registrationIP: { type: String, default: '' },
}, { timestamps: true });

// ── Indexes ─────────────────────────────────────────────
userSchema.index({ isOnline: 1 });
userSchema.index({ isSearchable: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ createdAt: -1 });

// ── Hash password ────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Hash security answer ─────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('securityAnswer') || !this.securityAnswer) return next();
  const salt = await bcrypt.genSalt(10);
  this.securityAnswer = await bcrypt.hash(this.securityAnswer, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.compareSecurityAnswer = async function (candidate) {
  return bcrypt.compare(candidate.toLowerCase(), this.securityAnswer);
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken  = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min
  return token;
};

module.exports = mongoose.model('User', userSchema);
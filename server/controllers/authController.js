const User    = require('../models/User');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { sendResetEmail } = require('../utils/mailer');

// ── Token Generator ──────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

// ── Cookie Options ───────────────────────────────────────
const getCookieOpts = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
});

// ── Safe User Payload (never expose sensitive fields) ────
const safeUser = (user) => ({
  _id:          user._id,
  username:     user.username,
  email:        user.email,
  avatar:       user.avatar,
  bio:          user.bio,
  role:         user.role,
  inviteCode:   user.inviteCode,
  isOnline:     user.isOnline,
  isSearchable: user.isSearchable,
  showLastSeen: user.showLastSeen,
  acceptedTerms: user.acceptedTerms,
  linkedAccounts: user.linkedAccounts,
  securityQuestion: user.securityQuestion,
  createdAt:    user.createdAt,
});

// ════════════════════════════════════════════════════════
// REGISTER
// ════════════════════════════════════════════════════════
exports.register = async (req, res) => {
  try {
    const { username, password, email, acceptedTerms } = req.body;

    // ── Validation ───────────────────────────────────────
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required.' });

    if (!acceptedTerms)
      return res.status(400).json({ message: 'You must accept the Terms of Service.' });

    const usernameRegex = /^[a-z0-9_.]+$/;
    if (!usernameRegex.test(username))
      return res.status(400).json({
        message: 'Username may only contain lowercase letters, numbers, underscores, and dots.',
      });

    if (username.length < 3 || username.length > 30)
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters.' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    // ── Duplicate Check ──────────────────────────────────
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists)
      return res.status(409).json({ message: 'Username already taken.' });

    if (email && email.trim()) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists)
        return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    // ── Create User ──────────────────────────────────────
    const inviteCode    = uuidv4().slice(0, 8).toUpperCase();
    const registrationIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.socket?.remoteAddress
      || '';

    const user = await User.create({
      username:     username.toLowerCase().trim(),
      password,
      email:        email ? email.toLowerCase().trim() : undefined,
      acceptedTerms: true,
      inviteCode,
      registrationIP,
      isOnline: true,
    });

    // ── Issue Token ──────────────────────────────────────
    const token = signToken(user._id);
    res.cookie('noothing_token', token, getCookieOpts());

    return res.status(201).json({
      message: 'Account created successfully.',
      user: safeUser(user),
    });

  } catch (err) {
    console.error('❌ Register error:', err);

    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(409).json({
        message: `${field === 'email' ? 'Email' : 'Username'} already in use.`,
      });
    }

    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required.' });

    // ── Find User (include password for comparison) ──────
    const user = await User.findOne({ username: username.toLowerCase().trim() })
      .select('+password');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid username or password.' });

    // ── Account State Checks ─────────────────────────────
    if (user.isDeleted)
      return res.status(403).json({ message: 'This account has been permanently deleted.' });

    if (user.isBanned)
      return res.status(403).json({
        message: `Your account has been banned. Reason: ${user.banReason || 'Terms of Service violation.'}`,
      });

    if (user.isDisabled) {
      // Re-enable on login
      user.isDisabled = false;
    }

    // ── Update Online Status ─────────────────────────────
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    // ── Issue Token ──────────────────────────────────────
    const token = signToken(user._id);
    res.cookie('noothing_token', token, getCookieOpts());

    return res.status(200).json({
      message: 'Login successful.',
      user: safeUser(user),
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// ════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════
exports.logout = async (req, res) => {
  try {
    // Update online status in DB
    await User.findByIdAndUpdate(
      req.user._id,
      { isOnline: false, lastSeen: new Date(), socketId: '' },
      { runValidators: false }
    );

    // Clear cookie
    res.clearCookie('noothing_token', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({ message: 'Logged out successfully.' });

  } catch (err) {
    console.error('❌ Logout error:', err);
    return res.status(500).json({ message: 'Logout failed.' });
  }
};

// ════════════════════════════════════════════════════════
// GET ME (Current Authenticated User)
// ════════════════════════════════════════════════════════
exports.getMe = async (req, res) => {
  try {
    // req.user is populated by protect middleware
    return res.status(200).json({ user: safeUser(req.user) });
  } catch (err) {
    console.error('❌ getMe error:', err);
    return res.status(500).json({ message: 'Failed to fetch user data.' });
  }
};

// ════════════════════════════════════════════════════════
// CHANGE USERNAME
// ════════════════════════════════════════════════════════
exports.changeUsername = async (req, res) => {
  try {
    const { newUsername, password } = req.body;

    if (!newUsername || !password)
      return res.status(400).json({ message: 'New username and current password are required.' });

    // ── Validate Format ──────────────────────────────────
    const regex = /^[a-z0-9_.]+$/;
    if (!regex.test(newUsername))
      return res.status(400).json({
        message: 'Username may only contain lowercase letters, numbers, underscores, and dots.',
      });

    if (newUsername.length < 3 || newUsername.length > 30)
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters.' });

    if (newUsername.toLowerCase() === req.user.username)
      return res.status(400).json({ message: 'New username must be different from current.' });

    // ── Verify Password ──────────────────────────────────
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Incorrect password.' });

    // ── Check Availability ───────────────────────────────
    const taken = await User.findOne({
      username: newUsername.toLowerCase(),
      _id: { $ne: req.user._id },
    });
    if (taken)
      return res.status(409).json({ message: 'That username is already taken.' });

    // ── Update ───────────────────────────────────────────
    user.username = newUsername.toLowerCase();
    await user.save();

    return res.status(200).json({
      message:  'Username updated successfully.',
      username: user.username,
    });

  } catch (err) {
    console.error('❌ changeUsername error:', err);
    if (err.code === 11000)
      return res.status(409).json({ message: 'Username already taken.' });
    return res.status(500).json({ message: 'Failed to update username.' });
  }
};

// ════════════════════════════════════════════════════════
// CHANGE PASSWORD
// ════════════════════════════════════════════════════════
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Current and new passwords are required.' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });

    if (currentPassword === newPassword)
      return res.status(400).json({ message: 'New password must differ from current password.' });

    // ── Verify Current Password ──────────────────────────
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ message: 'Current password is incorrect.' });

    // ── Update ───────────────────────────────────────────
    user.password = newPassword;
    await user.save(); // pre-save hook will hash it

    return res.status(200).json({ message: 'Password updated successfully.' });

  } catch (err) {
    console.error('❌ changePassword error:', err);
    return res.status(500).json({ message: 'Failed to update password.' });
  }
};

// ════════════════════════════════════════════════════════
// FORGOT PASSWORD (Send Reset Email)
// ════════════════════════════════════════════════════════
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim())
      return res.status(400).json({ message: 'Email address is required.' });

    // Always return the same message to prevent email enumeration attacks
    const genericResponse = {
      message: 'If an account with that email exists, a reset link has been sent.',
    };

    const user = await User.findOne({
      email:     email.toLowerCase().trim(),
      isDeleted: false,
      isBanned:  false,
    });

    if (!user) return res.status(200).json(genericResponse);

    // ── Generate Token ───────────────────────────────────
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // ── Send Email ───────────────────────────────────────
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendResetEmail(user.email, user.username, resetUrl);
    } catch (emailErr) {
      // Roll back token if email fails
      console.error('❌ Email send failed:', emailErr.message);
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        message: 'Failed to send reset email. Please try again later.',
      });
    }

    return res.status(200).json(genericResponse);

  } catch (err) {
    console.error('❌ forgotPassword error:', err);
    return res.status(500).json({ message: 'Password reset request failed.' });
  }
};

// ════════════════════════════════════════════════════════
// RESET PASSWORD (Consume Reset Token)
// ════════════════════════════════════════════════════════
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res.status(400).json({ message: 'Token and new password are required.' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    // ── Hash Incoming Token to Compare with DB ───────────
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpiry');

    if (!user)
      return res.status(400).json({
        message: 'Reset token is invalid or has expired. Please request a new one.',
      });

    // ── Set New Password ─────────────────────────────────
    user.password            = newPassword;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save(); // pre-save hook hashes password

    // ── Auto-login after reset ───────────────────────────
    const jwtToken = signToken(user._id);
    res.cookie('noothing_token', jwtToken, getCookieOpts());

    return res.status(200).json({
      message: 'Password reset successfully. You are now logged in.',
    });

  } catch (err) {
    console.error('❌ resetPassword error:', err);
    return res.status(500).json({ message: 'Password reset failed.' });
  }
};

// ════════════════════════════════════════════════════════
// DISABLE ACCOUNT (Soft Toggle)
// ════════════════════════════════════════════════════════
exports.disableAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: 'Password is required.' });

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Incorrect password.' });

    // Toggle disable state
    user.isDisabled = !user.isDisabled;

    if (user.isDisabled) {
      user.isOnline = false;
      user.lastSeen = new Date();
    }

    await user.save({ validateBeforeSave: false });

    const message = user.isDisabled
      ? 'Account has been disabled. It will be reactivated on next login.'
      : 'Account has been re-enabled.';

    return res.status(200).json({ message, isDisabled: user.isDisabled });

  } catch (err) {
    console.error('❌ disableAccount error:', err);
    return res.status(500).json({ message: 'Failed to toggle account status.' });
  }
};

// ════════════════════════════════════════════════════════
// DELETE ACCOUNT (Permanent — Irreversible)
// ════════════════════════════════════════════════════════
exports.deleteAccount = async (req, res) => {
  try {
    const { password, securityAnswer } = req.body;

    if (!password)
      return res.status(400).json({ message: 'Password is required to delete your account.' });

    // ── Verify Password ──────────────────────────────────
    const user = await User.findById(req.user._id)
      .select('+password +securityAnswer +securityQuestion');

    if (!user)
      return res.status(404).json({ message: 'User not found.' });

    if (!(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Incorrect password.' });

    // ── Verify Security Answer (if set) ──────────────────
    if (user.securityAnswer && user.securityQuestion) {
      if (!securityAnswer)
        return res.status(400).json({
          message: `Security answer required. Question: "${user.securityQuestion}"`,
          requiresSecurityAnswer: true,
          securityQuestion: user.securityQuestion,
        });

      const answerValid = await user.compareSecurityAnswer(securityAnswer);
      if (!answerValid)
        return res.status(401).json({ message: 'Incorrect security answer.' });
    }

    // ── Soft Delete (preserve message skeletons) ─────────
    user.isDeleted  = true;
    user.deletedAt  = new Date();
    user.isOnline   = false;
    user.socketId   = '';
    // Anonymize PII
    user.username   = `deleted_${user._id}`;
    user.email      = undefined;
    user.avatar     = { url: '', publicId: '' };
    user.bio        = '';
    user.blockedUsers = [];
    user.linkedAccounts = [];
    user.securityQuestion = '';
    user.securityAnswer   = undefined;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    // ── Clear Auth Cookie ────────────────────────────────
    res.clearCookie('noothing_token', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({ message: 'Account permanently deleted.' });

  } catch (err) {
    console.error('❌ deleteAccount error:', err);
    return res.status(500).json({ message: 'Account deletion failed. Please try again.' });
  }
};

// ════════════════════════════════════════════════════════
// VERIFY TOKEN (Lightweight check for frontend)
// ════════════════════════════════════════════════════════
exports.verifyToken = async (req, res) => {
  try {
    // If we reach here, protect middleware already validated the token
    return res.status(200).json({ valid: true, userId: req.user._id });
  } catch (err) {
    return res.status(401).json({ valid: false });
  }
};

// ════════════════════════════════════════════════════════
// REFRESH SESSION (Re-issue token)
// ════════════════════════════════════════════════════════
exports.refreshSession = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.isBanned || user.isDeleted)
      return res.status(403).json({ message: 'Account unavailable.' });

    const token = signToken(user._id);
    res.cookie('noothing_token', token, getCookieOpts());

    return res.status(200).json({
      message: 'Session refreshed.',
      user: safeUser(user),
    });

  } catch (err) {
    console.error('❌ refreshSession error:', err);
    return res.status(500).json({ message: 'Session refresh failed.' });
  }
};
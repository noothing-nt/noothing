const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { v4: uuidv4 } = require('uuid');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

const sendTokenCookie = (res, token) => {
  res.cookie('noothing_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// @POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, password, acceptedTerms } = req.body;

    if (!acceptedTerms) {
      return res.status(400).json({ message: 'You must accept the Terms of Service.' });
    }

    const usernameRegex = /^[a-z0-9_.]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: 'Username can only contain lowercase letters, numbers, underscores, and dots.',
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: 'Username must be 3–30 characters.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    const inviteCode = uuidv4().slice(0, 8);
    const user = await User.create({ username, password, acceptedTerms, inviteCode });

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        inviteCode: user.inviteCode,
        isOnline: true,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// @POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    user.isOnline = true;
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        inviteCode: user.inviteCode,
        isOnline: true,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// @POST /api/auth/logout
router.post('/logout', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
    });

    res.clearCookie('noothing_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during logout.' });
  }
});

// @GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
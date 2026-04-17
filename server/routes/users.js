const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// @GET /api/users/contacts  — Recent DM contacts (Added Route)
router.get('/contacts', protect, async (req, res) => {
  try {
    // Find all unique users this person has DMed or received DMs from
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: { $exists: true, $ne: null } },
        { recipient: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .select('sender recipient createdAt text image status')
      .lean();

    // Build unique contact map with last message
    const contactMap = new Map();

    for (const msg of messages) {
      const otherId =
        msg.sender.toString() === req.user._id.toString()
          ? msg.recipient?.toString()
          : msg.sender?.toString();

      if (!otherId) continue;

      if (!contactMap.has(otherId)) {
        contactMap.set(otherId, {
          _id: otherId,
          lastMessage: msg,
        });
      }
    }

    // Fetch user details for each contact
    const contactIds = [...contactMap.keys()];
    const users = await User.find({ _id: { $in: contactIds } })
      .select('username avatar isOnline lastSeen inviteCode')
      .lean();

    // Merge with last message
    const contacts = users.map((u) => ({
      ...u,
      lastMessage: contactMap.get(u._id.toString())?.lastMessage || null,
    }));

    // Sort by last message time
    contacts.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt)
        : 0;
      const bTime = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt)
        : 0;
      return bTime - aTime;
    });

    res.json(contacts);
  } catch (err) {
    console.error('Contacts error:', err);
    res.status(500).json({ message: 'Failed to fetch contacts.' });
  }
});

// @GET /api/users/search?q=username
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const users = await User.find({
      username: { $regex: `^${q}`, $options: 'i' },
      _id: { $ne: req.user._id },
    })
      .select('username avatar isOnline lastSeen')
      .limit(15);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Search failed.' });
  }
});

// @GET /api/users/:username
router.get('/:username', protect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('username avatar isOnline lastSeen bio');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user.' });
  }
});

// @PUT /api/users/profile  — Update bio
router.put('/profile', protect, async (req, res) => {
  try {
    const { bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio: bio?.slice(0, 150) },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// @POST /api/users/avatar  — Upload avatar to Cloudinary
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    // Delete old avatar from Cloudinary if exists
    if (req.user.avatar?.publicId) {
      await cloudinary.uploader.destroy(req.user.avatar.publicId);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          url: req.file.path,
          publicId: req.file.filename,
        },
      },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Avatar upload failed.' });
  }
});

// @GET /api/users/invite/:code  — Resolve invite link
router.get('/invite/:code', protect, async (req, res) => {
  try {
    const user = await User.findOne({ inviteCode: req.params.code })
      .select('username avatar isOnline');

    if (!user) return res.status(404).json({ message: 'Invalid invite code.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error resolving invite.' });
  }
});

module.exports = router;
const User         = require('../models/User');
const Message      = require('../models/Message');
const Block        = require('../models/Block');
const { cloudinary, uploadAvatar } = require('../config/cloudinary');

// ── Search ───────────────────────────────────────────────
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);

    const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Get blocked list to exclude
    const blocks = await Block.find({
      $or: [{ blocker: req.user._id }, { blocked: req.user._id }],
    }).select('blocker blocked');

    const blockedIds = blocks.map((b) =>
      b.blocker.toString() === req.user._id.toString()
        ? b.blocked
        : b.blocker
    );

    const users = await User.find({
      username:     { $regex: `^${escaped}`, $options: 'i' },
      _id:          { $ne: req.user._id, $nin: blockedIds },
      isSearchable: true,
      isDeleted:    false,
      isBanned:     false,
    })
      .select('username avatar isOnline lastSeen bio showLastSeen')
      .limit(15)
      .lean();

    // Mask last seen if user has hidden it
    const sanitized = users.map((u) => ({
      ...u,
      lastSeen: u.showLastSeen ? u.lastSeen : null,
    }));

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: 'Search failed.' });
  }
};

// ── Get Contacts (recent DMs) ────────────────────────────
exports.getContacts = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: { $exists: true, $ne: null } },
        { recipient: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .select('sender recipient createdAt text image status isDeleted isViewOnce messageType')
      .lean();

    const contactMap = new Map();
    for (const msg of messages) {
      const senderId    = msg.sender?.toString();
      const recipientId = msg.recipient?.toString();
      const myId        = req.user._id.toString();
      const otherId     = senderId === myId ? recipientId : senderId;
      if (!otherId || otherId === myId) continue;
      if (!contactMap.has(otherId)) contactMap.set(otherId, msg);
    }

    if (contactMap.size === 0) return res.json([]);

    const contactIds = [...contactMap.keys()];

    // Get blocked users
    const blocks = await Block.find({ blocker: req.user._id }).select('blocked');
    const blockedIds = new Set(blocks.map((b) => b.blocked.toString()));

    const users = await User.find({
      _id: { $in: contactIds },
      isDeleted: false,
    })
      .select('username avatar isOnline lastSeen inviteCode bio showLastSeen')
      .lean();

    const contacts = users.map((u) => ({
      ...u,
      lastMessage: contactMap.get(u._id.toString()) || null,
      isBlocked: blockedIds.has(u._id.toString()),
      lastSeen: u.showLastSeen ? u.lastSeen : null,
    }));

    contacts.sort((a, b) => {
      const aT = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bT = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bT - aT;
    });

    res.json(contacts);
  } catch (err) {
    console.error('getContacts error:', err);
    res.status(500).json({ message: 'Failed to fetch contacts.' });
  }
};

// ── Get User by Username OR ID ───────────────────────────
exports.getUserByUsername = async (req, res) => {
  try {
    const param = req.params.username;
    const query = { isDeleted: false };

    // Check if the parameter is a 24-character MongoDB ID
    if (/^[0-9a-fA-F]{24}$/.test(param)) {
      query._id = param;
    } else {
      query.username = param;
    }

    const user = await User.findOne(query)
      .select('username avatar isOnline lastSeen bio inviteCode showLastSeen')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({
      ...user,
      lastSeen: user.showLastSeen ? user.lastSeen : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user.' });
  }
};

// ── Update Profile ───────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { bio, isSearchable, showLastSeen, securityQuestion, securityAnswer } = req.body;

    const updates = {};
    if (bio !== undefined)           updates.bio           = bio.slice(0, 150);
    if (isSearchable !== undefined)  updates.isSearchable  = isSearchable;
    if (showLastSeen !== undefined)  updates.showLastSeen  = showLastSeen;
    if (securityQuestion)            updates.securityQuestion = securityQuestion;

    const user = await User.findById(req.user._id);
    Object.assign(user, updates);

    if (securityAnswer) user.securityAnswer = securityAnswer;

    await user.save();

    res.json({ user: await User.findById(req.user._id).select('-password') });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

// ── Upload Avatar ────────────────────────────────────────
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const existingUser = await User.findById(req.user._id);
    if (existingUser?.avatar?.publicId) {
      await cloudinary.uploader.destroy(existingUser.avatar.publicId).catch(console.error);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: { url: req.file.path, publicId: req.file.filename } },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Avatar upload failed.' });
  }
};

// ── Block / Unblock ──────────────────────────────────────
exports.toggleBlock = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    if (targetUserId === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot block yourself.' });

    const existing = await Block.findOne({
      blocker: req.user._id,
      blocked: targetUserId,
    });

    if (existing) {
      await Block.findByIdAndDelete(existing._id);
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { blockedUsers: targetUserId },
      });
      return res.json({ blocked: false, message: 'User unblocked.' });
    }

    await Block.create({ blocker: req.user._id, blocked: targetUserId });
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: targetUserId },
    });

    res.json({ blocked: true, message: 'User blocked.' });
  } catch (err) {
    res.status(500).json({ message: 'Block operation failed.' });
  }
};

// ── Clear Chat ───────────────────────────────────────────
exports.clearChat = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    await Message.deleteMany({
      $or: [
        { sender: req.user._id, recipient: targetUserId },
        { sender: targetUserId, recipient: req.user._id },
      ],
    });

    res.json({ message: 'Chat cleared.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear chat.' });
  }
};

// ── Resolve Invite ───────────────────────────────────────
exports.resolveInvite = async (req, res) => {
  try {
    const user = await User.findOne({
      inviteCode: req.params.code,
      isDeleted: false,
    }).select('username avatar isOnline lastSeen inviteCode bio showLastSeen');

    if (!user) return res.status(404).json({ message: 'Invalid invite code.' });

    res.json({
      ...user.toObject(),
      lastSeen: user.showLastSeen ? user.lastSeen : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error resolving invite.' });
  }
};

// ── Get Blocklist ────────────────────────────────────────
exports.getBlocklist = async (req, res) => {
  try {
    const blocks = await Block.find({ blocker: req.user._id })
      .populate('blocked', 'username avatar')
      .lean();

    res.json(blocks.map((b) => b.blocked));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blocklist.' });
  }
};

// ── Linked Accounts ──────────────────────────────────────
exports.addLinkedAccount = async (req, res) => {
  try {
    const { username, password } = req.body;

    const targetUser = await User.findOne({ username }).select('+password');
    if (!targetUser || !(await targetUser.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials for linked account.' });

    if (targetUser._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot link current account.' });

    const alreadyLinked = req.user.linkedAccounts.some(
      (a) => a.userId.toString() === targetUser._id.toString()
    );
    if (alreadyLinked)
      return res.status(409).json({ message: 'Account already linked.' });

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        linkedAccounts: {
          userId:   targetUser._id,
          username: targetUser.username,
          avatar:   targetUser.avatar?.url || '',
        },
      },
    });

    res.json({ message: 'Account linked.', username: targetUser.username });
  } catch (err) {
    res.status(500).json({ message: 'Failed to link account.' });
  }
};

exports.switchAccount = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUser = await User.findById(req.user._id);

    const linked = currentUser.linkedAccounts.find(
      (a) => a.userId.toString() === targetUserId
    );
    if (!linked) return res.status(403).json({ message: 'Account not linked.' });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || targetUser.isBanned || targetUser.isDeleted)
      return res.status(404).json({ message: 'Target account unavailable.' });

    const token = require('jsonwebtoken').sign(
      { id: targetUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie('noothing_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    targetUser.isOnline = true;
    await targetUser.save({ validateBeforeSave: false });

    res.json({
      user: {
        _id: targetUser._id, username: targetUser.username,
        avatar: targetUser.avatar, bio: targetUser.bio,
        inviteCode: targetUser.inviteCode, isOnline: true,
        role: targetUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to switch account.' });
  }
};
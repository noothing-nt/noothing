const User         = require('../models/User');
const Message      = require('../models/Message');
const Room         = require('../models/Room');
const mongoose     = require('mongoose');

// ── Admin auth middleware ────────────────────────────────
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin')
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  next();
};

// ── Dashboard ────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      totalMessages,
      totalRooms,
      newUsersToday,
      newUsers7d,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({ isOnline: true, isDeleted: false }),
      User.countDocuments({ isBanned: true }),
      Message.countDocuments({ isDeleted: false }),
      Room.countDocuments(),
      User.countDocuments({
        isDeleted: false,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      User.countDocuments({
        isDeleted: false,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const recentUsers = await User.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('username avatar isOnline isBanned isDisabled createdAt registrationIP role')
      .lean();

    res.json({
      stats: {
        totalUsers, activeUsers, bannedUsers,
        totalMessages, totalRooms, newUsersToday, newUsers7d,
        dbState: mongoose.connection.readyState === 1 ? 'connected' : 'degraded',
        uptime: `${Math.floor(process.uptime())}s`,
        nodeVersion: process.version,
        memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      recentUsers,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Dashboard error.' });
  }
};

// ── Get All Users ────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const page    = Math.max(1, parseInt(req.query.page) || 1);
    const limit   = 30;
    const skip    = (page - 1) * limit;
    const search  = req.query.search || '';

    const query = { isDeleted: false };
    if (search) query.username = { $regex: search, $options: 'i' };

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('username avatar isOnline isBanned isDisabled createdAt registrationIP role email')
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// ── Ban User ─────────────────────────────────────────────
exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin')
      return res.status(403).json({ message: 'Cannot ban admin accounts.' });

    user.isBanned  = true;
    user.banReason = reason || 'Terms of Service violation.';
    user.isOnline  = false;
    user.socketId  = '';
    await user.save({ validateBeforeSave: false });

    // Emit ban event via socket (handled in socketHandler)
    if (req.app.get('io')) {
      const io = req.app.get('io');
      if (user.socketId) {
        io.to(user.socketId).emit('account:banned', {
          reason: user.banReason,
        });
      }
    }

    res.json({ message: `User @${user.username} banned.` });
  } catch (err) {
    res.status(500).json({ message: 'Ban failed.' });
  }
};

// ── Unban User ───────────────────────────────────────────
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: false, banReason: '' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: `User @${user.username} unbanned.` });
  } catch (err) {
    res.status(500).json({ message: 'Unban failed.' });
  }
};

// ── Delete User (hard) ───────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin')
      return res.status(403).json({ message: 'Cannot delete admin accounts.' });

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.username  = `deleted_${user._id}`;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed.' });
  }
};
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// @POST /api/rooms  — Create room
router.post('/', protect, async (req, res) => {
  try {
    const { name, memberIds, isBurner } = req.body;

    const expiresAt = isBurner ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined;

    const room = await Room.create({
      name,
      creator: req.user._id,
      members: [req.user._id, ...memberIds],
      isBurner,
      expiresAt,
    });

    await room.populate('members', 'username avatar isOnline');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create room.' });
  }
});

// @GET /api/rooms  — Get my rooms
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('members', 'username avatar isOnline')
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rooms.' });
  }
});

// @GET /api/rooms/join/:inviteCode
router.get('/join/:inviteCode', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ inviteCode: req.params.inviteCode })
      .populate('members', 'username avatar isOnline');
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    // Add user if not already member
    if (!room.members.find(m => m._id.toString() === req.user._id.toString())) {
      room.members.push(req.user._id);
      await room.save();
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Failed to join room.' });
  }
});

module.exports = router;
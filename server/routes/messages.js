const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// @GET /api/messages/dm/:userId?page=1
router.get('/dm/:userId', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id },
      ],
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .lean();

    // Mark as delivered
    await Message.updateMany(
      {
        recipient: req.user._id,
        sender: req.params.userId,
        status: 'sent',
      },
      { status: 'delivered' }
    );

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages.' });
  }
});

// @GET /api/messages/room/:roomId?page=1
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      room: req.params.roomId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .lean();

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Error fetching room messages.' });
  }
});

// @POST /api/messages/image  — Upload image to Cloudinary
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided.' });

    res.json({
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ message: 'Image upload failed.' });
  }
});

// @DELETE /api/messages/:id  — Delete for everyone
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found.' });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    // Delete image from Cloudinary if exists
    if (message.image?.publicId) {
      await cloudinary.uploader.destroy(message.image.publicId);
    }

    message.isDeleted = true;
    message.text = '';
    message.image = { url: '', publicId: '' };
    await message.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed.' });
  }
});

// @PUT /api/messages/:id  — Edit message
router.put('/:id', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found.' });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    message.text = text;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({ message });
  } catch (err) {
    res.status(500).json({ message: 'Edit failed.' });
  }
});

// @DELETE /api/messages/view-once/:id  — View once self-destruct
router.delete('/view-once/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message || !message.isViewOnce) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    if (message.image?.publicId) {
      await cloudinary.uploader.destroy(message.image.publicId);
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'View-once destroy failed.' });
  }
});

module.exports = router;
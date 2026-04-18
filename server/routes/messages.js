const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { uploadMessage } = require('../config/cloudinary');
const multer  = require('multer');

// File upload storage (raw buffer for non-image files)
const fileStorage = multer.memoryStorage();
const uploadFile  = multer({ storage: fileStorage, limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/dm/:userId',          protect, ctrl.getDMMessages);
router.get('/room/:roomId',        protect, ctrl.getRoomMessages);
router.get('/notifications',       protect, ctrl.getNotifications);
router.post('/notifications/read', protect, ctrl.markNotificationsRead);
router.post('/image',              protect, uploadMessage.single('image'), ctrl.uploadImage);
router.post('/reaction/:id',       protect, ctrl.addReaction);
router.delete('/view-once/:id',    protect, ctrl.destroyViewOnce);
router.delete('/:id',              protect, ctrl.deleteMessage);
router.put('/:id',                 protect, ctrl.editMessage);

module.exports = router;
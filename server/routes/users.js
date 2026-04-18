const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');

router.get('/contacts',                    protect, ctrl.getContacts);
router.get('/search',                      protect, ctrl.searchUsers);
router.get('/blocklist',                   protect, ctrl.getBlocklist);
router.get('/invite/:code',                protect, ctrl.resolveInvite);
router.get('/:username',                   protect, ctrl.getUserByUsername);
router.put('/profile',                     protect, ctrl.updateProfile);
router.post('/avatar',                     protect, uploadAvatar.single('avatar'), ctrl.uploadAvatar);
router.post('/block/:targetUserId',        protect, ctrl.toggleBlock);
router.delete('/clear-chat/:targetUserId', protect, ctrl.clearChat);
router.post('/linked-accounts',            protect, ctrl.addLinkedAccount);
router.post('/switch-account/:targetUserId', protect, ctrl.switchAccount);

module.exports = router;
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect);
router.use(ctrl.requireAdmin);

router.get('/dashboard',         ctrl.getDashboard);
router.get('/users',             ctrl.getAllUsers);
router.post('/ban/:userId',      ctrl.banUser);
router.post('/unban/:userId',    ctrl.unbanUser);
router.delete('/user/:userId',   ctrl.deleteUser);

module.exports = router;
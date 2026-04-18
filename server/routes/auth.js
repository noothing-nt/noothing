const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { protect }     = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// ── Public Routes ────────────────────────────────────────
router.post('/register',        authLimiter, ctrl.register);
router.post('/login',           authLimiter, ctrl.login);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password',  authLimiter, ctrl.resetPassword);

// ── Protected Routes ─────────────────────────────────────
router.post('/logout',           protect, ctrl.logout);
router.get('/me',                protect, ctrl.getMe);
router.get('/verify',            protect, ctrl.verifyToken);
router.post('/refresh',          protect, ctrl.refreshSession);
router.put('/change-username',   protect, ctrl.changeUsername);
router.put('/change-password',   protect, ctrl.changePassword);
router.put('/disable-account',   protect, ctrl.disableAccount);
router.delete('/delete-account', protect, ctrl.deleteAccount);

module.exports = router;
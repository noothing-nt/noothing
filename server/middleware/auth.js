const jwt  = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token = req.cookies?.noothing_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: 'Unauthorized. Please sign in.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      '-password -resetPasswordToken -resetPasswordExpiry -securityAnswer'
    );

    if (!user)        return res.status(401).json({ message: 'User not found.' });
    if (user.isDeleted) return res.status(403).json({ message: 'Account deleted.' });
    if (user.isBanned)  return res.status(403).json({ message: `Banned: ${user.banReason}` });
    if (user.isDisabled) return res.status(403).json({ message: 'Account disabled.' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    return res.status(401).json({ message: 'Invalid token.' });
  }
};
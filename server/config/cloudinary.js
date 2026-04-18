const cloudinary  = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Avatar Storage ───────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'noothing/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

// ── Message Media Storage ────────────────────────────────
const messageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder:         isVideo ? 'noothing/videos' : 'noothing/messages',
      resource_type:  isVideo ? 'video' : 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'mp4', 'webm'],
      transformation: file.mimetype.startsWith('image/')
        ? [{ width: 1200, crop: 'limit', quality: 'auto:good' }]
        : undefined,
    };
  },
});

exports.cloudinary  = cloudinary;
exports.uploadAvatar  = multer({ storage: avatarStorage,  limits: { fileSize: 5  * 1024 * 1024 } });
exports.uploadMessage = multer({ storage: messageStorage, limits: { fileSize: 20 * 1024 * 1024 } });
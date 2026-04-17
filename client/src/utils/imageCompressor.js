import imageCompression from 'browser-image-compression';

export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,           // Max 1MB
    maxWidthOrHeight: 1920, // Max resolution
    useWebWorker: true,
    fileType: 'image/webp', // Convert to WebP
  };

  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch (err) {
    console.error('Compression failed:', err);
    return file; // Fallback to original
  }
};
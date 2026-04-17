/**
 * Backend E2EE payload structure validator.
 * Ensures incoming encrypted payloads are well-formed
 * before persisting to MongoDB.
 */

const validateEncryptedPayload = (payload) => {
  if (!payload) return null;

  // Plaintext mode (development / pre-E2EE)
  if (payload.algorithm === 'NONE' && payload.plaintext !== undefined) {
    return { algorithm: 'NONE', plaintext: payload.plaintext };
  }

  // AES-GCM mode (production E2EE)
  if (payload.algorithm === 'AES-GCM') {
    if (!payload.iv || !payload.ciphertext) return null;
    return {
      iv: payload.iv,
      ciphertext: payload.ciphertext,
      algorithm: 'AES-GCM',
    };
  }

  return null;
};

const sanitizeMessageText = (text, encryptedPayload) => {
  // If E2EE is active, text should be empty (ciphertext is in payload)
  if (encryptedPayload?.algorithm === 'AES-GCM') return '';
  return (text || '').slice(0, 5000);
};

module.exports = { validateEncryptedPayload, sanitizeMessageText };
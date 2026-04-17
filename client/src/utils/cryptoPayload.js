/**
 * E2EE PREPARATION LAYER
 * Structured for easy Web Crypto API injection.
 * Currently passes through plaintext — swap body of encryptText/decryptText
 * with AES-GCM when keys are established via a Diffie-Hellman exchange.
 */

export const encryptText = async (text, _recipientPublicKey) => {
  // PLACEHOLDER — inject AES-GCM encryption here
  // Example future implementation:
  // const key = await deriveSharedKey(recipientPublicKey);
  // const iv = crypto.getRandomValues(new Uint8Array(12));
  // const encoded = new TextEncoder().encode(text);
  // const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  // return { iv: btoa(String.fromCharCode(...iv)), ciphertext: btoa(...), algorithm: 'AES-GCM' };

  return {
    plaintext: text,      // Remove in production
    algorithm: 'NONE',   // Change to 'AES-GCM' when implemented
  };
};

export const decryptText = async (payload, _senderPublicKey) => {
  // PLACEHOLDER — inject decryption here
  if (payload.algorithm === 'NONE') return payload.plaintext;

  // Future:
  // const key = await deriveSharedKey(senderPublicKey);
  // const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  // return new TextDecoder().decode(decrypted);

  return '[Encrypted Message]';
};
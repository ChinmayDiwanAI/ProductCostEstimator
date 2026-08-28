/**
 * Client-side AES-GCM encryption for JSONBin.io sync
 * Uses Web Crypto API for secure encryption/decryption
 * Passphrase is never stored - only kept in memory during session
 */

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16; // 128 bits

/**
 * Derive an encryption key from a passphrase using PBKDF2
 */
async function deriveKey(passphrase: string, salt: BufferSource): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with a passphrase using AES-GCM
 * Returns base64-encoded string containing: salt + iv + ciphertext
 */
export async function encryptData(data: string, passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await deriveKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  // Combine: salt (16) + iv (12) + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data with a passphrase using AES-GCM
 * Expects base64-encoded string containing: salt + iv + ciphertext
 */
export async function decryptData(encryptedBase64: string, passphrase: string): Promise<string> {
  const decoder = new TextDecoder();

  // Decode base64
  const binaryString = atob(encryptedBase64);
  const combined = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    combined[i] = binaryString.charCodeAt(i);
  }

  // Extract components
  if (combined.length < SALT_LENGTH + IV_LENGTH) {
    throw new Error('Invalid encrypted data format');
  }

  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(passphrase, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error('Decryption failed - incorrect passphrase or corrupted data');
  }
}

/**
 * Test if a passphrase can decrypt the data
 * Useful for validating passphrase on connection test
 */
export async function testPassphrase(encryptedBase64: string, passphrase: string): Promise<boolean> {
  try {
    await decryptData(encryptedBase64, passphrase);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if data appears to be encrypted (has correct format)
 */
export function isEncrypted(data: string): boolean {
  try {
    const decoded = atob(data);
    // Check minimum length: salt (16) + iv (12) + at least 1 byte ciphertext
    return decoded.length >= SALT_LENGTH + IV_LENGTH + 1;
  } catch {
    return false;
  }
}
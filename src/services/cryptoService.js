const DB_NAME = 'epicpro_e2ee_keys_db';
const DB_VERSION = 1;
const STORE_NAME = 'user_keys';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Convert ArrayBuffer to Base64 String
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 String to ArrayBuffer
function base64ToArrayBuffer(base64) {
  if (typeof base64 !== 'string') return new ArrayBuffer(0);
  const cleanBase64 = base64.replace(/\s+/g, '');
  const binaryString = window.atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function spkiToPEM(spkiBuffer) {
  const base64 = arrayBufferToBase64(spkiBuffer);
  const pem = base64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN PUBLIC KEY-----\n${pem}\n-----END PUBLIC KEY-----`;
}


function pkcs8ToPEM(pkcs8Buffer) {
  const base64 = arrayBufferToBase64(pkcs8Buffer);
  const pem = base64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN PRIVATE KEY-----\n${pem}\n-----END PRIVATE KEY-----`;
}


function pemToBase64(pem) {
  return pem
    .replace(/-----BEGIN [A-Z ]+-----/, '')
    .replace(/-----END [A-Z ]+-----/, '')
    .replace(/\s+/g, '');
}

export const cryptoService = {

  generateKeyPair: async () => {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );

    const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    const publicKeyPEM = spkiToPEM(spki);
    const privateKeyPEM = pkcs8ToPEM(pkcs8);

    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      publicKeyPEM,
      privateKeyPEM,
    };
  },


  importPublicKey: async (pem) => {
    const base64 = pemToBase64(pem);
    const buffer = base64ToArrayBuffer(base64);
    return await window.crypto.subtle.importKey(
      'spki',
      buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
  },


  importPrivateKey: async (pem) => {
    const base64 = pemToBase64(pem);
    const buffer = base64ToArrayBuffer(base64);
    return await window.crypto.subtle.importKey(
      'pkcs8',
      buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['decrypt']
    );
  },


  savePrivateKey: async (userId, privateKeyPEM) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const record = {
        userId: String(userId),
        privateKeyPEM,
        updatedAt: new Date().toISOString(),
      };
      const request = store.put(record);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  },


  getPrivateKey: async (userId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(String(userId));

      request.onsuccess = (e) => {
        const result = e.target.result;
        resolve(result ? result.privateKeyPEM : null);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  },


  hasPrivateKey: async (userId) => {
    const key = await cryptoService.getPrivateKey(userId);
    return !!key;
  },


  clearPrivateKey: async (userId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(String(userId));

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  },


  downloadPrivateKeyBackup: (userId, privateKeyPEM) => {
    const blob = new Blob([privateKeyPEM], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `e2ee_private_key_user_${userId}.pem`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },


  encryptDiscussionDetails: async (fields, participantsPublicKeysMap) => {
    const aesKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const textEncoder = new TextEncoder();

    // Encrypt each text field with its own unique random 12-byte IV and return a JSON string {"data": "...", "iv": "..."}
    const encryptFieldToJSON = async (text) => {
      if (!text || typeof text !== 'string' || !text.trim()) {
        return;
      }
      const fieldIv = window.crypto.getRandomValues(new Uint8Array(12));
      const fieldIvBase64 = arrayBufferToBase64(fieldIv.buffer);
      const encoded = textEncoder.encode(text);
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: fieldIv },
        aesKey,
        encoded
      );
      const ciphertextBase64 = arrayBufferToBase64(encryptedBuffer);
      return JSON.stringify({
        data: ciphertextBase64,
        iv: fieldIvBase64,
      });
    };

    const encryptedTitle = await encryptFieldToJSON(fields.title);
    const encryptedDescription = await encryptFieldToJSON(fields.description);
    const encryptedConclusion = await encryptFieldToJSON(fields.conclusion);

    const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);

    const encryptedKeys = {};
    for (const [userId, publicKeyPEM] of Object.entries(participantsPublicKeysMap)) {
      if (publicKeyPEM) {
        const rsaPublicKey = await cryptoService.importPublicKey(publicKeyPEM);
        const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
          { name: 'RSA-OAEP' },
          rsaPublicKey,
          rawAesKey
        );
        encryptedKeys[userId] = arrayBufferToBase64(encryptedKeyBuffer);
      }
    }

    return {
      title: encryptedTitle,
      description: encryptedDescription,
      conclusion: encryptedConclusion,
      is_encrypted: 1,
      encryptedKeys,
    };
  },

  // --- Zero Knowledge Key Backup Helpers ---
  deriveBackupKey: async (password, saltBuffer) => {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  },

  encryptPrivateKeyForBackup: async (privateKeyPEM, password) => {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const derivedKey = await cryptoService.deriveBackupKey(password, salt);

    const encoder = new TextEncoder();
    const data = encoder.encode(privateKeyPEM);

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      derivedKey,
      data
    );

    return {
      encryptedBlob: arrayBufferToBase64(encryptedContent),
      salt: arrayBufferToBase64(salt),
      iv: arrayBufferToBase64(iv)
    };
  },

  decryptPrivateKeyFromBackup: async (encryptedBlobBase64, saltBase64, ivBase64, password) => {
    const salt = base64ToArrayBuffer(saltBase64);
    const iv = base64ToArrayBuffer(ivBase64);
    const encryptedBuffer = base64ToArrayBuffer(encryptedBlobBase64);

    const derivedKey = await cryptoService.deriveBackupKey(password, salt);

    try {
      const decryptedContent = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        derivedKey,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedContent);
    } catch (e) {
      throw new Error("Decryption failed. Incorrect backup password.");
    }
  },
};

export default cryptoService;

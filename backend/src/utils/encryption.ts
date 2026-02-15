import crypto from 'crypto';
import config from '../config/config';

const ALGORITHM = 'aes-256-cbc';
// Ensure key is 32 bytes (256 bits)
const KEY = crypto.scryptSync(config.jwtSecret || 'secret', 'salt', 32);
const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (text: string): string => {
    if (!text || !text.includes(':')) return text;
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

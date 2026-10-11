import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

// A password is never stored. We store a random "salt" and the scrambled result.
// The same password with a different salt gives a completely different result.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(':');
  if (!saltHex || !keyHex) return false;

  const expected = Buffer.from(keyHex, 'hex');
  const actual = (await scryptAsync(
    password,
    Buffer.from(saltHex, 'hex'),
    KEY_LENGTH,
  )) as Buffer;

  // timingSafeEqual avoids leaking how many characters matched through response time.
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

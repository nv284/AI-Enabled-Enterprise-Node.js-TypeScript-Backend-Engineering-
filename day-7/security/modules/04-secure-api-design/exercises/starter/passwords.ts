// Starter for Ex 3 — replace SHA-256 with argon2id.
import { createHash } from 'node:crypto';

export function hashPassword(plain: string): string {
  // ❌ Fast, unsalted, GPU-crackable in seconds. Replace with argon2.
  return createHash('sha256').update(plain).digest('hex');
}

export function verifyPassword(plain: string, stored: string): boolean {
  // ❌ Not constant-time; leaks timing info.
  return createHash('sha256').update(plain).digest('hex') === stored;
}

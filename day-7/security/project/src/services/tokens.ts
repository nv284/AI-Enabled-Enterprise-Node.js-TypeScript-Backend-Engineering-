import { createHash, randomBytes, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../db.js';

const ACCESS_TTL_SECONDS = 15 * 60;              // 15 min
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex');
}

export function issueAccessToken(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
    algorithm: 'HS256',
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn: ACCESS_TTL_SECONDS,
  });
}

export async function issueRefreshToken(userId: string, familyId = randomUUID()) {
  const raw = randomBytes(48).toString('base64url');
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: sha256(raw),
      familyId,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  return { raw, familyId };
}

export async function rotateRefreshToken(rawToken: string) {
  const hash = sha256(rawToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });

  if (!record) return { error: 'invalid' as const };

  if (record.revokedAt) {
    // Reuse of an already-rotated token: burn the whole family.
    await prisma.refreshToken.updateMany({
      where: { familyId: record.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { error: 'reuse_detected' as const };
  }

  if (record.expiresAt < new Date()) return { error: 'expired' as const };

  // Rotate: mark old revoked, issue new one in the same family.
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });
  return { userId: record.userId, familyId: record.familyId };
}

export async function revokeRefreshToken(rawToken: string) {
  const hash = sha256(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllForUser(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

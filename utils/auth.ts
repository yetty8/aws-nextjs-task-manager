// utils/auth.ts
import bcrypt from 'bcryptjs';
import { sign, verify, JwtPayload } from 'jsonwebtoken';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: object): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d',
    issuer: 'task-manager',
  });
}

export function verifyToken(token: string): string | JwtPayload {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return verify(token, process.env.JWT_SECRET);
}
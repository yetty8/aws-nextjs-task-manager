// lib/jwt.ts
import { createHmac } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

interface JwtPayload {
  [key: string]: any;
  iat?: number;
  exp?: number;
}

export function sign(payload: object, expiresIn: string | number = '1d'): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = typeof expiresIn === 'number' 
    ? now + expiresIn 
    : now + (parseInt(expiresIn) * 60 * 60 * 24); // default to days

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify({ ...payload, iat: now, exp }));
  const signature = createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=+$/, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verify(token: string): JwtPayload {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  
  const expectedSignature = createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=+$/, '');
  
  if (signature !== expectedSignature) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());
  
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}
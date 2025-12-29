// app/utils/auth.ts
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  console.log('Generated hash for password:', { password, hash: hashHex });
  return hashHex;
}

export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  try {
    const hashedInput = await hashPassword(password);
    console.log('Comparing passwords:', {
      inputHash: hashedInput,
      storedHash: hashedPassword,
      match: hashedInput === hashedPassword
    });
    return hashedInput === hashedPassword;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export async function generateToken(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}
// app/utils/auth.ts
import jwt from "jsonwebtoken";
import { createHmac } from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-key-for-testing-only-123456";

export function generateToken(payload: Record<string, any>): string {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
  } catch (error) {
    console.error("Token generation failed:", error);
    throw error;
  }
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function hashPassword(password: string): string {
  return createHmac("sha256", JWT_SECRET).update(password).digest("hex");
}

export function verifyPassword(
  password: string,
  hashedPassword: string,
): boolean {
  const hashed = hashPassword(password);
  return hashed === hashedPassword;
}

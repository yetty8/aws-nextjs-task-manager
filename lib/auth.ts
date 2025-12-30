// lib/auth.ts
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession as getServerSessionNextAuth } from "next-auth/next";
import { compare } from "bcryptjs";
import { getUserByEmail } from "./db";
import { createHash } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function isSHA256(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          console.log("🔑 Missing credentials");
          return null;
        }

        try {
          console.log("🔍 Looking up user:", credentials.email);
          const user = await getUserByEmail(credentials.email);

          if (!user || !user.password) {
            console.log("❌ No user found or missing password");
            return null;
          }

          console.log("👤 User found:", {
            email: user.email,
            hasPassword: !!user.password,
            passwordStarts: user.password?.substring(0, 10) + "...",
          });

          let isValid: boolean;

          if (isSHA256(user.password)) {
            // For backward compatibility with SHA-256 hashes
            console.log("🔑 Using SHA-256 comparison");
            const hashedPassword = createHash("sha256")
              .update(credentials.password)
              .digest("hex");
            isValid = hashedPassword === user.password;
          } else {
            // For new bcrypt hashes
            console.log("🔑 Using bcrypt comparison");
            isValid = await compare(credentials.password, user.password);
          }

          if (!isValid) {
            console.log("❌ Invalid password for user:", user.email);
            return null;
          }

          console.log("✅ Authentication successful for user:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("🔥 Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Type for the session with user ID
export type SessionWithUserId = Session & {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
};

// Helper function to get the session in API routes
export async function getServerSession(
  req: NextRequest | NextApiRequest,
  res?: NextApiResponse,
): Promise<SessionWithUserId | null> {
  if (res) {
    // For Pages Router API routes
    return (await getServerSessionNextAuth(
      req as NextApiRequest,
      res,
      authOptions,
    )) as SessionWithUserId | null;
  } else {
    // For App Router
    const session = await getToken({
      req: req as NextRequest,
      secret: process.env.NEXTAUTH_SECRET,
    });
    return session as SessionWithUserId | null;
  }
}

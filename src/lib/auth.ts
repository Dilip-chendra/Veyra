import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { UserSession, UserRole } from "../types/index.ts";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "veyra_jwt_auth_secret_key_production_grade_32_chars"
);

const SESSION_COOKIE = "veyra_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      orgId: (payload.orgId as string) || null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: any): Promise<UserSession | null> {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function assertAuthorizedUser(session: UserSession | null, targetUserId: string) {
  if (!session) throw new Error("Unauthorized: Please sign in");
  if (session.role === "ADMIN") return;
  if (session.userId !== targetUserId) {
    throw new Error("Forbidden: Access denied to requested resource");
  }
}

export function assertOrgAccess(session: UserSession | null, targetOrgId: string) {
  if (!session) throw new Error("Unauthorized: Please sign in");
  if (session.role === "ADMIN") return;
  if (session.orgId !== targetOrgId) {
    throw new Error("Forbidden: Access denied to organization data");
  }
}

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cookieNames } from "@/lib/cookies";

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export type UserSession = { userId: string; email: string };
export type AdminSession = { admin: true };

export async function createUserSession(payload: UserSession) {
  const key = secretKey();
  if (!key) throw new Error("Missing SESSION_SECRET");

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key);

  const jar = await cookies();
  jar.set(cookieNames.user, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getUserSession(): Promise<UserSession | null> {
  const key = secretKey();
  if (!key) return null;

  const jar = await cookies();
  const token = jar.get(cookieNames.user)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

export async function clearUserSession() {
  const jar = await cookies();
  jar.delete(cookieNames.user);
}

export async function createAdminSession() {
  const key = secretKey();
  if (!key) throw new Error("Missing SESSION_SECRET");

  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(key);

  const jar = await cookies();
  jar.set(cookieNames.admin, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const key = secretKey();
  if (!key) return null;

  const jar = await cookies();
  const token = jar.get(cookieNames.admin)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    if (payload.admin !== true) return null;
    return { admin: true };
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(cookieNames.admin);
}

export async function setSignupEmail(email: string) {
  const key = secretKey();
  if (!key) throw new Error("Missing SESSION_SECRET");

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30m")
    .sign(key);

  const jar = await cookies();
  jar.set(cookieNames.signup, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30,
  });
}

export async function getSignupEmail(): Promise<string | null> {
  const key = secretKey();
  if (!key) return null;

  const jar = await cookies();
  const token = jar.get(cookieNames.signup)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}

export async function clearSignupEmail() {
  const jar = await cookies();
  jar.delete(cookieNames.signup);
}

import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { cookieNames } from "@/lib/cookies";

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function hasValidToken(
  token: string | undefined,
  check: (payload: Record<string, unknown>) => boolean
) {
  if (!token) return false;
  const key = secretKey();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return check(payload as Record<string, unknown>);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const ok = await hasValidToken(
      request.cookies.get(cookieNames.user)?.value,
      (p) => typeof p.userId === "string" && typeof p.email === "string"
    );
    if (!ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const ok = await hasValidToken(
      request.cookies.get(cookieNames.admin)?.value,
      (p) => p.admin === true
    );
    if (!ok) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin", "/admin/:path*"],
};

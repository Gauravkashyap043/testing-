import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { setSignupEmail } from "@/lib/session";
import { User } from "@/lib/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dbErrorMessage(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const safe = message.replace(/mongodb\+srv:\/\/[^@]+@/i, "mongodb+srv://***@");
  if (/ENOTFOUND|querySrv|ECONNREFUSED|timed out|Server selection/i.test(safe)) {
    return "Could not reach MongoDB. In Atlas → Network Access, allow IP 0.0.0.0/0.";
  }
  if (/Authentication failed|bad auth|SCRAM/i.test(safe)) {
    return "MongoDB login failed. Check MONGODB_URI on Vercel (no quotes around the value).";
  }
  return safe || "Could not save email";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "Add MONGODB_URI in Vercel Environment Variables" },
        { status: 500 }
      );
    }

    if (!process.env.SESSION_SECRET) {
      return NextResponse.json(
        { error: "Add SESSION_SECRET in Vercel Environment Variables" },
        { status: 500 }
      );
    }

    await connectDb();

    const existing = await User.findOne({ email });
    if (existing?.passwordHash) {
      return NextResponse.json(
        { error: "Account already exists. Log in instead." },
        { status: 409 }
      );
    }

    if (!existing) {
      await User.create({ email });
    }

    await setSignupEmail(email);
    return NextResponse.json({ ok: true, email });
  } catch (err) {
    console.error("signup-email", err);
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
}

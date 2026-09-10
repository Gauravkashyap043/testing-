import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { setSignupEmail } from "@/lib/session";
import { User } from "@/lib/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "Add MONGODB_URI to .env.local" },
        { status: 500 }
      );
    }

    if (!process.env.SESSION_SECRET) {
      return NextResponse.json(
        { error: "Add SESSION_SECRET to .env.local" },
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
    return NextResponse.json({ error: "Could not save email" }, { status: 500 });
  }
}

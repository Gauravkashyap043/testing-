import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { verifyPassword } from "@/lib/password";
import { createUserSession } from "@/lib/session";
import { User } from "@/lib/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");

    if (!isValidEmail(email) || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDb();
    const user = await User.findOne({ email });

    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createUserSession({
      userId: user._id.toString(),
      email: user.email,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not log in" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  clearSignupEmail,
  createUserSession,
  getSignupEmail,
} from "@/lib/session";
import { User } from "@/lib/user";

export async function POST(request: Request) {
  try {
    const email = await getSignupEmail();
    if (!email) {
      return NextResponse.json(
        { error: "Start with your email first" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const password = String(body.password ?? "");

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDb();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.passwordHash) {
      return NextResponse.json(
        { error: "Account already set up. Log in instead." },
        { status: 409 }
      );
    }

    user.passwordHash = await hashPassword(password);
    await user.save();

    await clearSignupEmail();
    await createUserSession({
      userId: user._id.toString(),
      email: user.email,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not set password" },
      { status: 500 }
    );
  }
}

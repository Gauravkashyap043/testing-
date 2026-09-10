import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { User } from "@/lib/user";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDb();
    const users = await User.find({})
      .select("email passwordHash createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      users: users.map((u) => ({
        id: String(u._id),
        email: u.email,
        hasPassword: Boolean(u.passwordHash),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load users" },
      { status: 500 }
    );
  }
}

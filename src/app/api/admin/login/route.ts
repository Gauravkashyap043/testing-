import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const password = String(body.password ?? "");

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not sign in as admin" },
      { status: 500 }
    );
  }
}

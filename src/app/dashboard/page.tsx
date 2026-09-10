import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { User } from "@/lib/user";
import { LogoutButton } from "@/components/LogoutButton";
import { BrandMark } from "@/components/AuthShell";

export default async function DashboardPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  await connectDb();
  const user = await User.findById(session.userId).lean();
  if (!user) redirect("/login");

  return (
    <main className="dash">
      <div className="dash-top">
        <BrandMark />
        <LogoutButton action="/api/auth/logout" redirectTo="/login" />
      </div>
      <h1>Your account</h1>
      <p>Signed in and ready.</p>
      <div className="status-row">
        <div>
          <strong>Email</strong>
          {user.email}
        </div>
        <div>
          <strong>Status</strong>
          {user.passwordHash ? (
            <span className="pill">Complete</span>
          ) : (
            <span className="pill muted">Password not set</span>
          )}
        </div>
      </div>
    </main>
  );
}

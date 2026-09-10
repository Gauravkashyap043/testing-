import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { User } from "@/lib/user";
import { LogoutButton } from "@/components/LogoutButton";
import { BrandMark } from "@/components/AuthShell";

export default async function AdminPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  await connectDb();
  const users = await User.find({})
    .select("email passwordHash createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="dash">
      <div className="dash-top">
        <BrandMark />
        <LogoutButton action="/api/admin/logout" redirectTo="/admin/login" />
      </div>
      <h1>Users</h1>
      <p>
        {users.length} account{users.length === 1 ? "" : "s"} in the database.
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Password</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={String(u._id)}>
                <td>{u.email}</td>
                <td>
                  {u.passwordHash ? (
                    <span className="pill">Set</span>
                  ) : (
                    <span className="pill muted">Pending</span>
                  )}
                </td>
                <td>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td colSpan={3}>No users yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

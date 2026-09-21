import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { User } from "@/lib/user";
import { LogoutButton } from "@/components/LogoutButton";
import { BrandMark } from "@/components/AuthShell";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function IpCell({ value }: { value?: string | null }) {
  if (!value) {
    return <span className="pill muted">Not recorded</span>;
  }
  return <code>{value}</code>;
}

export default async function AdminPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  await connectDb();
  const users = await User.find({})
    .select("email ipAddress deviceIp createdAt updatedAt")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="dash">
      <div className="dash-top">
        <BrandMark />
        <LogoutButton action="/api/admin/logout" redirectTo="/admin/login" />
      </div>
      <h1>Form submissions</h1>
      <p>
        {users.length} user{users.length === 1 ? "" : "s"} who submitted email
        on signup.
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Public IP</th>
              <th>Device IP</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={String(u._id)}>
                <td>{u.email}</td>
                <td>
                  <IpCell value={u.ipAddress} />
                </td>
                <td>
                  <IpCell value={u.deviceIp} />
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
                <td colSpan={4}>No submissions yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

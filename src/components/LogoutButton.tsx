"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({
  action,
  redirectTo,
}: {
  action: string;
  redirectTo: string;
}) {
  const router = useRouter();

  async function logout() {
    await fetch(action, { method: "POST" });
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button type="button" className="btn-ghost" onClick={logout}>
      Log out
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteUserButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = window.confirm(`Delete submission for ${email}?`);
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error || "Could not delete user");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      window.alert("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="btn-danger"
      onClick={onDelete}
      disabled={loading}
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}

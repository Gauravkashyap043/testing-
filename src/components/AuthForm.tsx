"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Props = {
  action: string;
  fields: { name: string; type: string; label: string; placeholder?: string; autoComplete?: string }[];
  submitLabel: string;
  onSuccess?: () => void;
  redirectTo?: string;
};

export function AuthForm({
  action,
  fields,
  submitLabel,
  onSuccess,
  redirectTo,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    for (const field of fields) {
      body[field.name] = String(form.get(field.name) ?? "");
    }

    try {
      const res = await fetch(action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      onSuccess?.();
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="auth-form">
      {fields.map((field) => (
        <label key={field.name} className="field">
          <span>{field.label}</span>
          <input
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            required
          />
        </label>
      ))}

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Working…" : submitLabel}
      </button>
    </form>
  );
}

import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export default function AdminLoginPage() {
  return (
    <AuthShell
      title="Admin access"
      subtitle="Enter the shared admin password from your environment."
    >
      <AuthForm
        action="/api/admin/login"
        submitLabel="Enter admin"
        redirectTo="/admin"
        fields={[
          {
            name: "password",
            type: "password",
            label: "Admin password",
            autoComplete: "current-password",
          },
        ]}
      />
    </AuthShell>
  );
}

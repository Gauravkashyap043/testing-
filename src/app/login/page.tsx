import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in with the email and password you set up."
      footer={
        <>
          New here? <Link href="/signup">Create an account</Link>
        </>
      }
    >
      <AuthForm
        action="/api/auth/login"
        submitLabel="Log in"
        redirectTo="/dashboard"
        fields={[
          {
            name: "email",
            type: "email",
            label: "Email",
            placeholder: "you@company.com",
            autoComplete: "email",
          },
          {
            name: "password",
            type: "password",
            label: "Password",
            placeholder: "••••••••",
            autoComplete: "current-password",
          },
        ]}
      />
    </AuthShell>
  );
}

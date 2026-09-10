import Link from "next/link";

export function BrandMark() {
  return (
    <Link href="/" className="brand">
      Harbor
    </Link>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="auth-shell">
      <div className="auth-panel">
        <BrandMark />
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </div>
    </main>
  );
}

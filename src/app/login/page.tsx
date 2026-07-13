"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import BrandMark from "@/app/components/BrandMark";
import {
  fetchAuthProviders,
  isMockMode,
  socialLoginUrl,
  type AuthProvider,
  type SocialProvider,
} from "@/lib/api";

type AuthMode = "login" | "signup";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_state: "That sign-in link expired. Please try again.",
  oauth_denied: "Sign-in was cancelled.",
  oauth_email:
    "That email already has an account. Sign in with your original method first.",
  oauth_unavailable: "That sign-in option isn't available right now.",
  oauth_failed: "Social sign-in didn't complete. Please try again.",
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function sanitizeRedirect(path: string | null): string {
  if (!path || !path.startsWith("/")) {
    return "/problems";
  }
  if (path.startsWith("//")) {
    return "/problems";
  }
  return path;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, isLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>(() => {
    const code = searchParams.get("error");
    return code ? OAUTH_ERRORS[code] || "Sign-in failed. Please try again." : "";
  });
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null);

  const redirectTo = useMemo(
    () => sanitizeRedirect(searchParams.get("redirect")),
    [searchParams]
  );

  useEffect(() => {
    fetchAuthProviders()
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  const handleSocial = async (provider: SocialProvider) => {
    setErrorMessage("");
    if (!isMockMode()) {
      // Real OAuth: hand off to the backend as a top-level navigation.
      window.location.href = socialLoginUrl(provider);
      return;
    }
    // Public mock demo: simulate a social sign-in against the sample data.
    setSocialPending(provider);
    const label = provider === "google" ? "Google" : "GitHub";
    try {
      await signup({
        name: `${label} Explorer`,
        email: `${provider}.demo+${Date.now()}@katalume.dev`,
        password: "oauth-demo-1234",
      });
      router.replace(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in.";
      setErrorMessage(message);
      setSocialPending(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage("Email and password are required.");
      return;
    }
    if (mode === "signup" && !trimmedName) {
      setErrorMessage("Name is required for signup.");
      return;
    }

    try {
      if (mode === "login") {
        await login({ email: trimmedEmail, password: trimmedPassword });
      } else {
        await signup({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
        });
      }
      router.replace(redirectTo);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to authenticate.";
      setErrorMessage(message);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <BrandMark className="h-10 w-10" />
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Katalume
          </span>
        </div>

        <div className="card p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {mode === "login" ? "Sign in to continue" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Practice machine learning into mastery. LeetCode rigor meets Kaggle depth.
          </p>
        </div>

        {providers.length > 0 && (
          <div className="mb-6 space-y-2.5">
            {providers.some((p) => p.id === "google") && (
              <button
                type="button"
                onClick={() => handleSocial("google")}
                disabled={socialPending !== null}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:bg-white/[0.06]"
              >
                {socialPending === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="h-4 w-4" />
                )}
                Continue with Google
              </button>
            )}
            {providers.some((p) => p.id === "github") && (
              <button
                type="button"
                onClick={() => handleSocial("github")}
                disabled={socialPending !== null}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:bg-white/[0.06]"
              >
                {socialPending === "github" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GithubIcon className="h-4 w-4" />
                )}
                Continue with GitHub
              </button>
            )}
            <div className="flex items-center gap-3 pt-1.5">
              <span className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                or continue with email
              </span>
              <span className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 rounded-xl border border-black/[0.06] bg-zinc-100/70 p-1 dark:border-white/[0.06] dark:bg-white/[0.03]">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "login"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100"
            }`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Name
              </span>
              <input
                required
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-brand-500/40 transition placeholder:text-zinc-400 focus:border-brand-500/50 focus:ring-2 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100"
                placeholder="Ada Lovelace"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-brand-500/40 transition placeholder:text-zinc-400 focus:border-brand-500/50 focus:ring-2 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Password
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-brand-500/40 transition placeholder:text-zinc-400 focus:border-brand-500/50 focus:ring-2 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100"
              placeholder="••••••••"
            />
          </label>

          {errorMessage && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-2.5"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
          By continuing you agree to practice responsibly. No spam, ever.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-zinc-500 dark:text-zinc-400">
          Loading authentication...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

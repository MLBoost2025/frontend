"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Github, Loader2, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type AuthMode = "login" | "signup";

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
  const { login, signup, isLoading, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const redirectTo = useMemo(
    () => sanitizeRedirect(searchParams.get("redirect")),
    [searchParams]
  );

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

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
    <div className="flex min-h-screen flex-col bg-[#d7dbe0]">
      <header className="border-b border-[#d4d9df] bg-[#f4f6f8]">
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-5 text-[#5b6673]">
            <span className="text-xl text-[#f59e0b]">△</span>
            <nav className="hidden items-center gap-5 text-[22px] sm:flex">
              <Link href="/learn" className="text-sm hover:text-[#121827]">
                Explore
              </Link>
              <Link href="/problems" className="text-sm hover:text-[#121827]">
                Problems
              </Link>
              <Link href="/competitions" className="text-sm hover:text-[#121827]">
                Contest
              </Link>
              <Link href="/progress" className="text-sm hover:text-[#121827]">
                Discuss
              </Link>
              <Link href="/tracks" className="text-sm hover:text-[#121827]">
                Interview
              </Link>
              <span className="text-sm text-[#e89400]">Store</span>
            </nav>
          </div>
          <div className="hidden h-9 items-center gap-2 rounded-xl border border-[#d7dce2] bg-[#eceff3] px-3 text-[#8b95a3] md:flex">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search</span>
          </div>
          <button className="rounded-xl bg-[#f8ead4] px-3 py-1.5 text-sm font-medium text-[#e89400]">
            Premium
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1240px] flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-[420px] rounded border border-[#d3d8df] bg-[#f6f7f9] p-7 shadow-[0_1px_0_#c9ced6]">
          <div className="mb-6 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#131922] text-xl text-[#f59e0b]">
              △
            </div>
            <h1 className="mt-3 text-[2rem] font-semibold tracking-tight text-[#171b23]">
              MLBoost
            </h1>
          </div>

          <div className="mb-4 grid grid-cols-2 rounded border border-[#d2d7df] bg-white p-1">
            <button
              type="button"
              data-testid="auth-tab-login"
              onClick={() => setMode("login")}
              className={`rounded py-2 text-sm ${
                mode === "login"
                  ? "bg-[#455d69] font-medium text-white"
                  : "text-[#5f6b79] hover:bg-[#eef2f6]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              data-testid="auth-tab-signup"
              onClick={() => setMode("signup")}
              className={`rounded py-2 text-sm ${
                mode === "signup"
                  ? "bg-[#455d69] font-medium text-white"
                  : "text-[#5f6b79] hover:bg-[#eef2f6]"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" ? (
              <label htmlFor="name-input" className="block">
                <span className="sr-only">Name</span>
                <input
                  id="name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name"
                  className="w-full rounded border border-[#cbd2db] bg-white px-3 py-2.5 text-sm text-[#1a212b] outline-none ring-[#4f6773] placeholder:text-[#8ca0b2] focus:ring-1"
                />
              </label>
            ) : null}
            <label htmlFor="email-input" className="block">
              <span className="sr-only">Email</span>
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Username or E-mail"
                className="w-full rounded border border-[#cbd2db] bg-white px-3 py-2.5 text-sm text-[#1a212b] outline-none ring-[#4f6773] placeholder:text-[#8ca0b2] focus:ring-1"
              />
            </label>
            <label htmlFor="password-input" className="block">
              <span className="sr-only">Password</span>
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full rounded border border-[#cbd2db] bg-white px-3 py-2.5 text-sm text-[#1a212b] outline-none ring-[#4f6773] placeholder:text-[#8ca0b2] focus:ring-1"
              />
            </label>

            <div className="rounded border border-[#d2d7df] bg-white px-3 py-2 text-sm text-[#2a313d]">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  ✓
                </span>
                Security check passed
              </span>
            </div>

            {errorMessage ? (
              <p className="rounded border border-[#e7bcbc] bg-[#fff4f4] px-3 py-2 text-sm text-[#ac2323]">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              data-testid="auth-submit"
              className="flex w-full items-center justify-center gap-2 rounded bg-[#455d69] py-2.5 text-sm font-medium text-white hover:bg-[#3f5561] disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm text-[#4b5e6d]">
            <Link href="#" className="hover:underline">
              Forgot Password?
            </Link>
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="hover:underline"
            >
              {mode === "login" ? "Sign Up" : "Back to Login"}
            </button>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-center text-sm text-[#98a1ad]">or continue with</p>
            <div className="flex items-center justify-center gap-3">
              <button className="rounded-full border border-[#d3d9e1] bg-white p-2 text-[#5f6d7a]">
                G
              </button>
              <button className="rounded-full border border-[#d3d9e1] bg-white p-2 text-[#5f6d7a]">
                <Github className="h-4 w-4" />
              </button>
              <button className="rounded-full border border-[#d3d9e1] bg-white px-2.5 py-2 text-[#5f6d7a]">
                ...
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d4d9df] bg-[#f4f6f8] py-4 text-center text-sm text-[#6f7b89]">
        Copyright © 2026 MLBoost · Help · Jobs · Terms · Privacy Policy
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#d8dce0] text-[#4f5966]">
          Loading authentication...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

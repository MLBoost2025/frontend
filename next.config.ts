import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// A production deploy is only required to be fully wired to a backend when it is
// actually serving live data. A mock-mode deploy is a self-contained demo (all
// data, sign-up and sign-in run against bundled sample data) and needs no backend,
// so it is allowed to build without backend credentials.
if (process.env.VERCEL_ENV === "production" && process.env.NEXT_PUBLIC_API_MODE === "live") {
  const errors: string[] = [];
  if (process.env.NEXT_PUBLIC_API_FALLBACK_TO_MOCK !== "false") errors.push("mock fallback must be disabled");
  for (const key of ["BACKEND_API_URL", "NEXT_PUBLIC_SITE_URL"]) {
    try {
      const value = process.env[key];
      if (!value || new URL(value).protocol !== "https:") errors.push(`${key} must be an HTTPS URL`);
    } catch {
      errors.push(`${key} must be a valid HTTPS URL`);
    }
  }
  if (errors.length) throw new Error(`Unsafe production configuration: ${errors.join("; ")}`);
}

const apiOrigin = (() => {
  try { return process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : ""; }
  catch { return ""; }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // Pyodide compiles the locally served CPython WebAssembly module. The
  // narrowly-scoped wasm token does not permit JavaScript eval.
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""} https://*.ingest.sentry.io`,
  "worker-src 'self' blob:",
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: { root: __dirname },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/pyodide/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=31536000" }],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});

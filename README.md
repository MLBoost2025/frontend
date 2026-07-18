# Katalume frontend

**Practice machine learning into mastery.**

Katalume is the training ground for machine learning — solve real ML problems
in an in-browser judge, compete in contests, and climb to mastery. LeetCode
rigor meets Kaggle depth.

The name combines **kata**, deliberate practice that forges mastery, with
**lume**, light or illumination—the moment a hard problem clicks.

Built with Next.js 16 (App Router) and React 19.

## Stack

- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS v4, `next-themes` (light/dark)
- Locally bundled Monaco editor + Pyodide CPython practice sandbox
- 198 live practice problems with a stable 60-problem free catalog
- Katalume Plus weekly/monthly/yearly and Lumus lifetime membership surfaces
- Cashfree-hosted checkout; signed backend webhooks are the only access grant path
- Sentry for error tracking + tracing
- Vitest + Testing Library (unit), Playwright (e2e)

## Getting started

Requirements: Node 24.

```bash
npm install
cp .env.example .env.local     # then fill in as needed
npm run dev                    # http://localhost:3000
```

Out of the box the app runs in **mock mode** (see below), so it works fully with
no backend running.

### Environment

See [.env.example](.env.example) for all variables. Key ones:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_MODE` | `mock` (in-file data, default), `live` (real backend), or `auto` |
| `BACKEND_API_URL` | Server-only private backend base URL used by the same-origin BFF |
| `NEXT_PUBLIC_SITE_URL` | Canonical public HTTPS origin |
| `NEXT_PUBLIC_API_FALLBACK_TO_MOCK` | In live mode, fall back to mock on API error. Set `false` in production so failures surface |
| `NEXT_PUBLIC_EXECUTION_MODE` | `browser` for the free local practice judge; `server` for a future isolated judge |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Sentry client / server DSNs (capture is off unless set) |

**Mock vs live:** every data call goes through a switch in
[`src/lib/api.ts`](src/lib/api.ts). In `mock` mode it returns bundled sample
data so the UI is fully usable offline. In `live`/`auto` mode it calls the
same-origin `/api` BFF with Secure/HttpOnly cookies and, unless
`NEXT_PUBLIC_API_FALLBACK_TO_MOCK=false`, falls back to mock data on error.
OAuth also starts and returns through this gateway. This keeps the session
first-party on either a free `vercel.app` hostname or a future custom domain.

Practice execution is separate from API mode. The free public beta uses an
exact, pinned CPython WebAssembly runtime in a disposable Web Worker. Run checks
the two visible examples; Submit checks the full local suite (8 Easy, 25 Medium,
50 Hard). These are practice tests—not secret or ranked contest tests. A server
judge can be enabled later without changing problem or submission contracts.
During the free beta, practice history and solved progress stay in that browser's
local storage; account-synced judging and ranked contests remain disabled until
the isolated server judge is enabled.

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests |

## Project structure

```
src/
  app/                 App Router routes (dashboard, problems, arena, profile, ...)
    api/[...path]/      same-origin private-backend BFF
    problems/[slug]/   the solve "arena" (Monaco editor, run/submit, history)
    components/        shared UI (Navbar, Sidebar, ThemeSwitcher, ...)
  lib/api.ts           data layer with the mock/live switch
  context/AuthContext  auth state
  context/BillingContext verified membership state
  proxy.ts             route gating through backend Session validation
```

## Testing

```bash
npm run test:unit      # Vitest
npm run test:e2e       # Playwright (installs browsers on first run)
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, and build,
then e2e against a production build.

Billing UI is safe to deploy before commercial activation. If the backend
reports checkout disabled, the pricing catalog is visible but no payment flow
opens and no charge is attempted.

## Deploy

Optimized for [Vercel](https://vercel.com/). Set the production env vars
(`NEXT_PUBLIC_API_MODE=live`, `BACKEND_API_URL`, `NEXT_PUBLIC_SITE_URL`, mock
fallback disabled, `NEXT_PUBLIC_EXECUTION_MODE=browser`, and Sentry DSNs) in the
project settings before deploying.

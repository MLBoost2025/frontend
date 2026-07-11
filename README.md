# MLBoost frontend

The web app for **MLBoost** — an interactive platform for practicing machine
learning and data science, think **LeetCode meets Kaggle** for ML students.
Browse problems, solve them in an in-browser code editor, run and submit against
test cases, follow interview tracks, and track your progress.

Built with Next.js 16 (App Router) and React 19.

## Stack

- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS v4, `next-themes` (light/dark)
- Monaco editor (`@monaco-editor/react`) for the solve arena
- Sentry for error tracking + tracing
- Vitest + Testing Library (unit), Playwright (e2e)

## Getting started

Requirements: Node 20+.

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
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API in live/auto mode |
| `NEXT_PUBLIC_API_FALLBACK_TO_MOCK` | In live mode, fall back to mock on API error. Set `false` in production so failures surface |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Sentry client / server DSNs (capture is off unless set) |

**Mock vs live:** every data call goes through a switch in
[`src/lib/api.ts`](src/lib/api.ts). In `mock` mode it returns bundled sample
data so the UI is fully usable offline. In `live`/`auto` mode it calls the
backend (attaching the stored bearer token) and, unless
`NEXT_PUBLIC_API_FALLBACK_TO_MOCK=false`, falls back to mock data on error.

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
    problems/[slug]/   the solve "arena" (Monaco editor, run/submit, history)
    components/        shared UI (Navbar, Sidebar, ThemeSwitcher, ...)
  lib/api.ts           data layer with the mock/live switch
  context/AuthContext  auth state
  middleware.ts        route gating on the auth cookie
```

## Testing

```bash
npm run test:unit      # Vitest
npm run test:e2e       # Playwright (installs browsers on first run)
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, and build,
then e2e against a production build.

## Deploy

Optimized for [Vercel](https://vercel.com/). Set the production env vars
(`NEXT_PUBLIC_API_MODE=live`, a real `NEXT_PUBLIC_API_URL`, Sentry DSNs) in the
project settings before deploying.

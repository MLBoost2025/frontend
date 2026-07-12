import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // In CI, exercise the production bundle; locally use the dev server.
    command: process.env.CI
      ? "npm run build && npm run start -- --port 4173"
      : "npm run dev -- --port 4173",
    url: "http://127.0.0.1:4173/login",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Browser coverage exercises the deterministic mock product flow. This also
    // keeps a developer's local live-stack `.env.local` from changing CI behavior.
    env: {
      ...process.env,
      NEXT_PUBLIC_API_MODE: "mock",
      NEXT_PUBLIC_API_FALLBACK_TO_MOCK: "true",
    },
  },
});

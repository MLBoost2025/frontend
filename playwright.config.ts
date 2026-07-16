import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : "list",
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
    // Always exercise the production bundle. Running several browser journeys
    // against the dev compiler can make navigation assertions race route
    // compilation and does not represent the artifact we ship.
    command: "npm run build && npm run start -- --port 4173",
    url: "http://127.0.0.1:4173/login",
    reuseExistingServer: false,
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

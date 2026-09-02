import { defineConfig, devices } from "@playwright/test";

// With PREVIEW_URL set we test the deployed preview; otherwise Playwright
// builds and serves the app locally.
const baseURL = process.env.PREVIEW_URL ?? "http://127.0.0.1:3000";

const httpCredentials = process.env.PLAYWRIGHT_HTTP_CREDENTIALS
  ? {
      username: process.env.PLAYWRIGHT_HTTP_CREDENTIALS.split(":")[0],
      password: process.env.PLAYWRIGHT_HTTP_CREDENTIALS.split(":")
        .slice(1)
        .join(":"),
    }
  : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL,
    httpCredentials,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["iPhone 15"] } },
  ],
  webServer: process.env.PREVIEW_URL
    ? undefined
    : {
        command: "pnpm build && pnpm start:standalone",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});

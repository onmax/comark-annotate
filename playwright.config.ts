import { defineConfig, devices } from "@playwright/test";

// A few end-to-end checks of the built docs site in Chromium, so CI proves the demos work without slowing it down.
export default defineConfig({
  testDir: "e2e",
  testMatch: "*.e2e.ts",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:4173", ...devices["Desktop Chrome"] },
  webServer: {
    command: "node e2e/serve.ts",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});

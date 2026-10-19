import { defineConfig, devices } from "@playwright/test";

// A few end-to-end checks of the built docs site in Chromium, so CI proves the demos work without slowing it down.
export default defineConfig({
  testDir: "e2e",
  testMatch: "*.e2e.ts",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    ...devices["Desktop Chrome"],
    // Headless Chromium hides scrollbars; show them, so a test sees the shift a desktop reader would.
    launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] },
  },
  webServer: {
    command: "node e2e/serve.ts",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});

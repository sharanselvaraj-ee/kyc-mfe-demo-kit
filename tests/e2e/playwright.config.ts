// SLIDE: "The harness is the real guarantee" (M1 needs only a Playwright smoke test per geo)
import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  testDir: ".",
  fullyParallel: true,
  reporter: process.env.CI ? [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:5173",
  },
  webServer: [
    {
      command: `${ROOT}/packages/agent/node_modules/.bin/tsx ${ROOT}/packages/agent/src/server.ts`,
      // port (not url): the agent only serves /api/agent/blueprint, so "/" legitimately
      // 404s — a url-based check would wait forever for a 2xx it'll never get.
      port: 8787,
      reuseExistingServer: !process.env.CI,
      env: { KYC_AGENT_MODE: "recorded" },
      cwd: ROOT,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: `${ROOT}/node_modules/.bin/pnpm --filter @kyc/host dev`,
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      cwd: ROOT,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});

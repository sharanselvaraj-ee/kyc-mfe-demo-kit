// SLIDE: "Runtime streaming vs static compilation" (LITE-003: baked at build time, no runtime agent call)
import { test, expect } from "@playwright/test";

test("[LITE-003] the lite bundle never requests the agent or blueprint endpoint", async ({ page }) => {
  const agentRequests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/agent")) agentRequests.push(r.url());
  });

  await page.goto("/?kyc-lite=1");
  await expect(page.getByText("Illustrative rules: demo only (lite)")).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeVisible();

  expect(agentRequests).toEqual([]);
});

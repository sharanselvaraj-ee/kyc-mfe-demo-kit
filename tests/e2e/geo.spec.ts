// SLIDE: "The harness is the real guarantee" (one smoke test per geo, recorded mode, never calls Claude)
import { test, expect } from "@playwright/test";

const GEOS = ["GB", "IN", "AE", "SG"] as const;

const EXPECTED_FIELD: Record<(typeof GEOS)[number], string> = {
  GB: "Full name",
  IN: "National ID number",
  AE: "Residency permit expiry",
  SG: "National ID number",
};

// Matches each geo's illustrative validation pattern (see packages/mocks/src/fixtures)
// so Continue isn't blocked by ONB-ID-001/ONB-ADDR-001 while walking to the target field.
const NATIONAL_ID_FOR: Record<(typeof GEOS)[number], string> = {
  GB: "",
  IN: "123456789012",
  AE: "123456789012345",
  SG: "A1234567B",
};
const POSTCODE_FOR: Record<(typeof GEOS)[number], string> = { GB: "SW1A 2AA", IN: "560001", AE: "", SG: "560001" };

for (const geo of GEOS) {
  test(`[TRC-001][RT-001][FLG-001][FLG-006][MFE-001] ${geo} renders a Claude-composed form from the recorded blueprint`, async ({ page }) => {
    // The host's default geo is GB; only switch (and wait for a fresh request) for the others.
    if (geo === "GB") {
      const featuresRequests: string[] = [];
      page.on("request", (r) => {
        if (r.url().includes("/api/features")) featuresRequests.push(r.url());
      });
      const responsePromise = page.waitForResponse((r) => r.url().includes("/api/agent/blueprint"));
      await page.goto("/");
      const response = await responsePromise;
      // [RT-001] the source header; x-agent-model/latency/tokens are live-only
      // (recorded mode never calls Claude, so there's nothing to report) — those
      // are verified against the real live endpoint in docs/VERSIONS.md's checks.
      expect(response.headers()["x-agent-source"]).toBe("recorded");
      // [FLG-006]
      await expect(page.getByText("Illustrative rules: demo only")).toBeVisible();
      // [FLG-001] exactly one /features request for the whole session, even after
      // walking through several steps below.
      await page.getByLabel("Full name").fill("Test value");
      await page.getByLabel("Date of birth").fill("1990-01-01");
      await page.getByRole("button", { name: "Continue" }).click();
      await expect(page.getByLabel("City")).toBeVisible();
      expect(featuresRequests).toHaveLength(1);
      // [MFE-001] the host's own markup includes exactly one host-authored <script>
      // (main.ts); the micro-frontend never injects another at runtime.
      const scriptSrcs = await page.locator("script[src]").evaluateAll((els) => els.map((e) => e.getAttribute("src")));
      expect(scriptSrcs.filter((s) => s?.includes("main.ts"))).toHaveLength(1);
      return;
    } else {
      await page.goto("/");
      // main.ts's own async init (worker.start() + initLoader()) attaches the geo-select
      // listener — it hasn't necessarily run yet when goto("load") resolves. Waiting for
      // the initial GB kyc:ready proves init completed before we touch the dropdown.
      await expect(page.locator("#event-log")).toContainText('"geo":"GB"');
      const responsePromise = page.waitForResponse((r) => r.url().includes("/api/agent/blueprint"));
      await page.locator("#geo-select").selectOption(geo);
      expect((await responsePromise).headers()["x-agent-source"]).toBe("recorded");
      // The network response resolving doesn't mean React has re-rendered yet (and
      // "Full name" exists on every geo's step 0, so it can't tell old from new) —
      // wait for the real signal: kyc:ready firing for THIS geo (MFE-002).
      await expect(page.locator("#event-log")).toContainText(`"geo":"${geo}"`);
    }

    await expect(page.getByLabel("Full name")).toBeVisible();
    // Walk every step until the field unique to this geo appears, filling whatever's
    // required along the way so ONB-FLOW-001's validation lets Continue through.
    for (let i = 0; i < 4; i++) {
      if (await page.getByLabel(EXPECTED_FIELD[geo]).isVisible().catch(() => false)) break;
      const nextButton = page.getByRole("button", { name: "Continue" });
      if (!(await nextButton.isVisible().catch(() => false))) break;

      for (const input of await page.locator('section input[type="text"], section input[type="date"]').all()) {
        const type = await input.getAttribute("type");
        const id = await input.getAttribute("id");
        const value =
          type === "date"
            ? "1990-01-01"
            : id === "nationalId"
              ? NATIONAL_ID_FOR[geo]
              : id === "postcode"
                ? POSTCODE_FOR[geo]
                : "Test value";
        await input.fill(value);
      }
      await nextButton.click();
    }
    await expect(page.getByLabel(EXPECTED_FIELD[geo])).toBeVisible();
  });
}

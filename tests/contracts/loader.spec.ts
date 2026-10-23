// SLIDE: "Two cadences, one architecture: shell and slot" (LITE-001: the loader rule, unit-tested in isolation)
import { describe, it, expect } from "vitest";
import { chooseVariant } from "@kyc/loader/src/choose-variant.js";

describe("chooseVariant", () => {
  it("[LITE-001] chooses lite for IN on a slow connection", () => {
    expect(chooseVariant("IN", null, { effectiveType: "3g" }, "")).toBe("lite");
    expect(chooseVariant("IN", null, { saveData: true }, "")).toBe("lite");
  });

  it("[LITE-001] chooses full for IN on a fast connection", () => {
    expect(chooseVariant("IN", null, { effectiveType: "4g" }, "")).toBe("full");
  });

  it("[LITE-001] chooses full for a geo with no lite bundle, even on a slow connection", () => {
    expect(chooseVariant("GB", null, { effectiveType: "2g" }, "")).toBe("full");
  });

  it("[LITE-001] variant=\"full\" always wins", () => {
    expect(chooseVariant("IN", "full", { effectiveType: "2g" }, "?kyc-lite=1")).toBe("full");
  });

  it("[LITE-001] variant=\"lite\" or ?kyc-lite=1 forces lite for an eligible geo", () => {
    expect(chooseVariant("IN", "lite", undefined, "")).toBe("lite");
    expect(chooseVariant("IN", null, undefined, "?kyc-lite=1")).toBe("lite");
  });
});

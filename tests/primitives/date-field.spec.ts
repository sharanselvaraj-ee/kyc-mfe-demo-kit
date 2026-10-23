// SLIDE: "The harness is the real guarantee" (same assertions, both compile targets — IR-002)
import { describe, it, expect, vi } from "vitest";
import { reactAdapter } from "./adapters/react-adapter.js";
import { svelteAdapter } from "./adapters/svelte-adapter.js";
import type { Adapter } from "./adapter.js";

const adapters: Adapter[] = [reactAdapter, svelteAdapter];

describe.each(adapters)("DateField ($name)", (adapter) => {
  it("[IR-002] renders as a native date input", () => {
    const harness = adapter.renderDateField({ fieldId: "dob", label: "Date of birth", onChange: vi.fn() });
    const input = harness.getByLabelText("Date of birth") as HTMLInputElement;
    expect(input.type).toBe("date");
    harness.unmount();
  });

  it("[IR-002] calls onChange with the typed value", () => {
    const onChange = vi.fn();
    const harness = adapter.renderDateField({ fieldId: "dob", label: "Date of birth", onChange });
    harness.fireChange(harness.getByLabelText("Date of birth"), "1990-05-14");
    expect(onChange).toHaveBeenCalledWith("1990-05-14");
    harness.unmount();
  });
});

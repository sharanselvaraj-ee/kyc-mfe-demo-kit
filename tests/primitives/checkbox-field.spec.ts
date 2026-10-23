// SLIDE: "The harness is the real guarantee" (same assertions, both compile targets — IR-002)
import { describe, it, expect, vi } from "vitest";
import { reactAdapter } from "./adapters/react-adapter.js";
import { svelteAdapter } from "./adapters/svelte-adapter.js";
import type { Adapter } from "./adapter.js";

const adapters: Adapter[] = [reactAdapter, svelteAdapter];

describe.each(adapters)("CheckboxField ($name)", (adapter) => {
  it("[IR-002] reflects the checked prop", () => {
    const harness = adapter.renderCheckboxField({ fieldId: "consent", label: "I agree", checked: true, onChange: vi.fn() });
    const input = harness.getByLabelText("I agree") as HTMLInputElement;
    expect(input.checked).toBe(true);
    harness.unmount();
  });

  it("[IR-002] calls onChange on click", () => {
    const onChange = vi.fn();
    const harness = adapter.renderCheckboxField({ fieldId: "consent", label: "I agree", checked: false, onChange });
    harness.fireClick(harness.getByLabelText("I agree"));
    expect(onChange).toHaveBeenCalledWith(true);
    harness.unmount();
  });
});

// SLIDE: "The harness is the real guarantee" (same assertions, both compile targets — IR-002)
import { describe, it, expect, vi } from "vitest";
import { reactAdapter } from "./adapters/react-adapter.js";
import { svelteAdapter } from "./adapters/svelte-adapter.js";
import type { Adapter } from "./adapter.js";

const adapters: Adapter[] = [reactAdapter, svelteAdapter];

describe.each(adapters)("TextField ($name)", (adapter) => {
  it("[IR-002] renders the label and current value", () => {
    const harness = adapter.renderTextField({ fieldId: "name", label: "Full name", value: "Ada", onChange: vi.fn() });
    const input = harness.getByLabelText("Full name") as HTMLInputElement;
    expect(input.value).toBe("Ada");
    harness.unmount();
  });

  it("[IR-002] calls onChange with the typed value", () => {
    const onChange = vi.fn();
    const harness = adapter.renderTextField({ fieldId: "name", label: "Full name", onChange });
    const input = harness.getByLabelText("Full name");
    harness.fireChange(input, "Grace Hopper");
    expect(onChange).toHaveBeenCalledWith("Grace Hopper");
    harness.unmount();
  });

  it("[IR-002] shows the hint and wires aria-describedby", () => {
    const harness = adapter.renderTextField({
      fieldId: "name",
      label: "Full name",
      hint: "As it appears on your ID",
      onChange: vi.fn(),
    });
    const input = harness.getByLabelText("Full name");
    expect(input.getAttribute("aria-describedby")).toBe("name-hint");
    expect(harness.queryByText("As it appears on your ID")).not.toBeNull();
    harness.unmount();
  });
});

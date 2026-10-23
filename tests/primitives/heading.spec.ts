// SLIDE: "The harness is the real guarantee" (same assertions, both compile targets — IR-002)
import { describe, it, expect } from "vitest";
import { reactAdapter } from "./adapters/react-adapter.js";
import { svelteAdapter } from "./adapters/svelte-adapter.js";
import type { Adapter } from "./adapter.js";

const adapters: Adapter[] = [reactAdapter, svelteAdapter];

describe.each(adapters)("Heading ($name)", (adapter) => {
  it("[IR-002] renders the given text", () => {
    const harness = adapter.renderHeading({ text: "Personal details" });
    expect(harness.queryByText("Personal details")).not.toBeNull();
    harness.unmount();
  });
});

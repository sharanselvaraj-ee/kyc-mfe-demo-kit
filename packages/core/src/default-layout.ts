// SLIDE: "Headless core: logic without a framework" (the deterministic fallback layout, RT-006 step 4)
import type { LayoutPlan } from "@kyc/contracts";
import type { Policy } from "./policy.js";

/**
 * No-Claude-needed layout: every field in one plainly-titled step, in policy
 * order. Used only when the live call, the cache and the recorded blueprint
 * have all failed (RT-006) — it's deliberately boring so it's obviously the
 * last resort, not a disguised live response.
 */
export function computeDefaultLayoutPlan(policy: Policy): LayoutPlan {
  return {
    steps: [
      {
        title: "Your details",
        items: policy.fields.map((field) => ({
          component: field.component,
          fieldId: field.fieldId,
          label: field.label,
          ...(field.hint ? { hint: field.hint } : {}),
        })),
      },
    ],
  };
}

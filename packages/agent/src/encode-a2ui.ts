// SLIDE: "A2UI: agents declare UI as data" (deterministic encode — a seam for trying direct A2UI generation later)
import type { LayoutPlan } from "@kyc/contracts";
import { A2UI_CATALOG_ID, A2UI_PROTOCOL_VERSION } from "@kyc/contracts";

/**
 * Encodes a layout plan as A2UI v0.9 messages. M1 only renders a single flat
 * surface (one step's worth of fields, no nested containers), so this emits
 * `createSurface` + one `updateComponents` with every item as a sibling —
 * no `updateDataModel` yet (there is no two-way-bound data model until a
 * container/children primitive exists). See docs/LIMITS.md.
 */
export function encodeLayoutPlanAsA2ui(plan: LayoutPlan, surfaceId: string): unknown[] {
  const components = plan.steps.flatMap((step) =>
    step.items.map((item) => ({
      id: item.fieldId,
      component: item.component,
      fieldId: item.fieldId,
      label: item.label,
      ...(item.hint ? { hint: item.hint } : {}),
    })),
  );

  return [
    {
      version: A2UI_PROTOCOL_VERSION,
      createSurface: { surfaceId, catalogId: A2UI_CATALOG_ID },
    },
    {
      version: A2UI_PROTOCOL_VERSION,
      updateComponents: { surfaceId, components },
    },
  ];
}

export function toJsonl(messages: unknown[]): string {
  return messages.map((message) => JSON.stringify(message)).join("\n") + "\n";
}

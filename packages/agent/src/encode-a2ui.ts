// SLIDE: "A2UI: agents declare UI as data" (deterministic encode — a seam for trying direct A2UI generation later)
import type { LayoutPlan } from "@kyc/contracts";
import { A2UI_CATALOG_ID, A2UI_PROTOCOL_VERSION } from "@kyc/contracts";

/**
 * Encodes a layout plan as A2UI v0.9 messages, one surface per step (so the
 * browser can navigate between them — the step machine, not Claude, owns
 * navigation). Each surface is a flat sibling list (no nested containers yet,
 * see docs/LIMITS.md): a deterministically-inserted Heading for the step's
 * title — Claude wrote the title, but never has to pick a fieldId-less
 * component itself — followed by the step's fields. No `updateDataModel` yet;
 * field values are plain local React state, not a bound data model.
 */
export function encodeLayoutPlanAsA2ui(plan: LayoutPlan, surfaceIdPrefix: string): { surfaceIds: string[]; messages: unknown[] } {
  const surfaceIds = plan.steps.map((_, index) => `${surfaceIdPrefix}-step-${index}`);
  const messages = plan.steps.flatMap((step, index) => {
    const surfaceId = surfaceIds[index];
    const components = [
      { id: "heading", component: "Heading", text: step.title },
      ...step.items.map((item) => ({
        id: item.fieldId,
        component: item.component,
        fieldId: item.fieldId,
        label: item.label,
        ...(item.hint ? { hint: item.hint } : {}),
      })),
    ];

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
  });

  return { surfaceIds, messages };
}

/**
 * [RT-002] Dev-only toggle: appends an unknown `CreditScoreGauge` component
 * to the first surface, labelled as a test injection, so the browser's
 * catalog allowlist can be demonstrated dropping it with a warning.
 */
export function injectUnknownComponent(messages: unknown[], surfaceIds: string[]): unknown[] {
  const firstSurfaceId = surfaceIds[0];
  if (!firstSurfaceId) return messages;
  return [
    ...messages,
    {
      version: A2UI_PROTOCOL_VERSION,
      updateComponents: {
        surfaceId: firstSurfaceId,
        components: [
          {
            id: "test-injection-unknown-component",
            component: "CreditScoreGauge",
            label: "Test injection (RT-002): this component is not in the catalog",
          },
        ],
      },
    },
  ];
}

export function toJsonl(messages: unknown[]): string {
  return messages.map((message) => JSON.stringify(message)).join("\n") + "\n";
}

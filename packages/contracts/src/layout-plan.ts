// SLIDE: "Zero-trust UI: data, not code" (component/fieldId enums built per request, RT-001)
// Uses zod/v4 specifically: @anthropic-ai/sdk's zodOutputFormat() requires v4-shaped
// schemas internally, while the rest of this package stays on classic zod ("zod") to
// match @a2ui/web_core's peer dependency. Both subpaths coexist in zod 3.25+. See
// docs/VERSIONS.md.
import { z } from "zod/v4";

/**
 * Claude's structured-output schema, built fresh per request so `component` is
 * restricted to the catalog's names and `fieldId` to the geo policy's fields
 * (CLAUDE.md §2 "the agent arranges; the core decides"). Zod's structured-output
 * support can't express min/max lengths, so callers re-check those separately.
 */
export function buildLayoutPlanSchema(
  componentNames: readonly [string, ...string[]],
  fieldIds: readonly [string, ...string[]],
) {
  const item = z.object({
    component: z.enum(componentNames),
    fieldId: z.enum(fieldIds),
    label: z.string(),
    hint: z.string().optional(),
  });

  return z.object({
    steps: z.array(
      z.object({
        title: z.string(),
        items: z.array(item),
      }),
    ),
  });
}

export type LayoutPlan = z.infer<ReturnType<typeof buildLayoutPlanSchema>>;
export type LayoutPlanItem = LayoutPlan["steps"][number]["items"][number];

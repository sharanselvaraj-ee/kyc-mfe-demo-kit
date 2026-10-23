// SLIDE: "Zero-trust UI: data, not code" (the allowlist Claude's output is restricted to)
import { TextField, DateField, Heading, Notice, SelectField, FileField, CheckboxField } from "@kyc/gen-react";
import {
  CATALOG_PROP_SCHEMAS,
  CATALOG_COMPONENT_KINDS,
  type CatalogComponentName,
  type CatalogComponentKind,
} from "@kyc/contracts";
import type { ComponentType } from "react";
import type { z } from "zod";

export interface CatalogEntry {
  name: CatalogComponentName;
  /** One-line description — this is also what Claude sees in the agent's prompt. */
  description: string;
  kind: CatalogComponentKind;
  propsSchema: z.ZodTypeAny;
  Component: ComponentType<Record<string, unknown>>;
}

const DESCRIPTIONS: Record<CatalogComponentName, string> = {
  Heading: "A section or step title. Display-only, no user input.",
  Notice: "A short inline note or explainer. Display-only, no user input.",
  TextField: "A single-line text input with a label and an optional hint.",
  DateField: "A native date input with a label and an optional hint.",
  SelectField: "A dropdown with a label, optional hint and a fixed list of options.",
  FileField: "A file picker for one document, with a label and an optional hint.",
  CheckboxField: "A single checkbox with a label and an optional hint.",
};

const COMPONENTS: Record<CatalogComponentName, ComponentType<Record<string, unknown>>> = {
  Heading,
  Notice,
  TextField,
  DateField,
  SelectField,
  FileField,
  CheckboxField,
};

export const CATALOG: Record<CatalogComponentName, CatalogEntry> = Object.fromEntries(
  (Object.keys(CATALOG_PROP_SCHEMAS) as CatalogComponentName[]).map((name) => [
    name,
    {
      name,
      description: DESCRIPTIONS[name],
      kind: CATALOG_COMPONENT_KINDS[name],
      propsSchema: CATALOG_PROP_SCHEMAS[name],
      Component: COMPONENTS[name],
    },
  ]),
) as Record<CatalogComponentName, CatalogEntry>;

export const CATALOG_NAMES = Object.keys(CATALOG) as [CatalogComponentName, ...CatalogComponentName[]];

/** Catalog names the agent may choose for a Claude-composed field layout (excludes display-only primitives — see docs/LIMITS.md). */
export const FIELD_CATALOG_NAMES = CATALOG_NAMES.filter(
  (name) => CATALOG[name].kind !== "display",
) as [CatalogComponentName, ...CatalogComponentName[]];

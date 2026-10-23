// SLIDE: "Zero-trust UI: data, not code" (the allowlist Claude's output is restricted to)
import { TextField, DateField } from "@kyc/gen-react";
import { TextFieldPropsSchema, DateFieldPropsSchema, type CatalogComponentName } from "@kyc/contracts";
import type { ComponentType } from "react";
import type { z } from "zod";

export interface CatalogEntry {
  name: CatalogComponentName;
  /** One-line description — this is also what Claude sees in the agent's prompt. */
  description: string;
  propsSchema: z.ZodTypeAny;
  Component: ComponentType<Record<string, unknown>>;
}

export const CATALOG: Record<CatalogComponentName, CatalogEntry> = {
  TextField: {
    name: "TextField",
    description: "A single-line text input with a label and an optional hint.",
    propsSchema: TextFieldPropsSchema,
    Component: TextField,
  },
  DateField: {
    name: "DateField",
    description: "A native date input with a label and an optional hint.",
    propsSchema: DateFieldPropsSchema,
    Component: DateField,
  },
};

export const CATALOG_NAMES = Object.keys(CATALOG) as [CatalogComponentName, ...CatalogComponentName[]];

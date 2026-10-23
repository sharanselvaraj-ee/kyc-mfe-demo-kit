// SLIDE: "Zero-trust UI: data, not code" (prop schemas the browser validates every blueprint against, RT-003)
import { z } from "zod";

const baseFieldProps = {
  fieldId: z.string(),
  label: z.string(),
  hint: z.string().optional(),
  value: z.string().optional(),
};

export const TextFieldPropsSchema = z.object(baseFieldProps);
export type TextFieldProps = z.infer<typeof TextFieldPropsSchema>;

export const DateFieldPropsSchema = z.object(baseFieldProps);
export type DateFieldProps = z.infer<typeof DateFieldPropsSchema>;

export const CATALOG_PROP_SCHEMAS = {
  TextField: TextFieldPropsSchema,
  DateField: DateFieldPropsSchema,
} as const;

export type CatalogComponentName = keyof typeof CATALOG_PROP_SCHEMAS;

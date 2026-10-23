// SLIDE: "Zero-trust UI: data, not code" (prop schemas the browser validates every blueprint against, RT-003)
import { z } from "zod";

const baseFieldProps = {
  fieldId: z.string(),
  label: z.string(),
  hint: z.string().optional(),
};

export const HeadingPropsSchema = z.object({ text: z.string() });
export type HeadingProps = z.infer<typeof HeadingPropsSchema>;

export const NoticePropsSchema = z.object({ text: z.string() });
export type NoticeProps = z.infer<typeof NoticePropsSchema>;

export const TextFieldPropsSchema = z.object({ ...baseFieldProps, value: z.string().optional() });
export type TextFieldProps = z.infer<typeof TextFieldPropsSchema>;

export const DateFieldPropsSchema = z.object({ ...baseFieldProps, value: z.string().optional() });
export type DateFieldProps = z.infer<typeof DateFieldPropsSchema>;

export const SelectFieldOptionSchema = z.object({ value: z.string(), label: z.string() });

export const SelectFieldPropsSchema = z.object({
  ...baseFieldProps,
  value: z.string().optional(),
  options: z.array(SelectFieldOptionSchema),
});
export type SelectFieldProps = z.infer<typeof SelectFieldPropsSchema>;

export const FileFieldPropsSchema = z.object({ ...baseFieldProps, value: z.string().optional() });
export type FileFieldProps = z.infer<typeof FileFieldPropsSchema>;

export const CheckboxFieldPropsSchema = z.object({ ...baseFieldProps, checked: z.boolean().optional() });
export type CheckboxFieldProps = z.infer<typeof CheckboxFieldPropsSchema>;

/**
 * How the browser wires local state to a catalog component — not sent over
 * the wire, just a static fact about each primitive (CLAUDE.md: business
 * rules live in core, never in primitives; this is rendering plumbing only).
 */
export type CatalogComponentKind = "display" | "text" | "boolean" | "file";

export const CATALOG_PROP_SCHEMAS = {
  Heading: HeadingPropsSchema,
  Notice: NoticePropsSchema,
  TextField: TextFieldPropsSchema,
  DateField: DateFieldPropsSchema,
  SelectField: SelectFieldPropsSchema,
  FileField: FileFieldPropsSchema,
  CheckboxField: CheckboxFieldPropsSchema,
} as const;

export const CATALOG_COMPONENT_KINDS: Record<CatalogComponentName, CatalogComponentKind> = {
  Heading: "display",
  Notice: "display",
  TextField: "text",
  DateField: "text",
  SelectField: "text",
  FileField: "file",
  CheckboxField: "boolean",
};

export type CatalogComponentName = keyof typeof CATALOG_PROP_SCHEMAS;

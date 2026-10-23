// SLIDE: "Zero-trust UI: data, not code" (the lite bundle's own copy of the allowlist — no packages/catalog, that's React-coupled)
import { Catalog, type ComponentApi } from "@a2ui/web_core";
import {
  A2UI_CATALOG_ID,
  A2UI_PROTOCOL_VERSION,
  HeadingPropsSchema,
  NoticePropsSchema,
  TextFieldPropsSchema,
  DateFieldPropsSchema,
  SelectFieldPropsSchema,
  FileFieldPropsSchema,
  CheckboxFieldPropsSchema,
  CATALOG_COMPONENT_KINDS,
  type CatalogComponentName,
  type CatalogComponentKind,
} from "@kyc/contracts";
import { TextField, DateField, Heading, Notice, SelectField, FileField, CheckboxField } from "@kyc/gen-svelte";

const PROP_SCHEMAS = {
  Heading: HeadingPropsSchema,
  Notice: NoticePropsSchema,
  TextField: TextFieldPropsSchema,
  DateField: DateFieldPropsSchema,
  SelectField: SelectFieldPropsSchema,
  FileField: FileFieldPropsSchema,
  CheckboxField: CheckboxFieldPropsSchema,
} as const;

export const SVELTE_COMPONENTS: Record<CatalogComponentName, unknown> = {
  Heading,
  Notice,
  TextField,
  DateField,
  SelectField,
  FileField,
  CheckboxField,
};

export function kindOf(type: string): CatalogComponentKind | undefined {
  return CATALOG_COMPONENT_KINDS[type as CatalogComponentName];
}

export function propsSchemaFor(type: string) {
  return PROP_SCHEMAS[type as CatalogComponentName];
}

const componentApis: ComponentApi[] = Object.entries(PROP_SCHEMAS).map(([name, schema]) => ({ name, schema }));

export const liteCatalog = new Catalog(A2UI_CATALOG_ID, A2UI_PROTOCOL_VERSION, componentApis);

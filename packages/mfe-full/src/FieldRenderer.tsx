// SLIDE: "Zero-trust UI: data, not code" (RT-002/RT-003: unknown types and bad props never render)
import { catalogEntryFor } from "./catalog.js";
import type { Values } from "@kyc/core";

export interface RenderedComponent {
  id: string;
  type: string;
  properties: Record<string, unknown>;
}

interface Props {
  component: RenderedComponent;
  values: Values;
  onChange: (fieldId: string, value: string | boolean) => void;
  /** [ONB-DOC-001] For FileField only: runs the mocked upload round trip before the value is set. */
  onFileSelected?: (fieldId: string, filename: string) => void;
}

export function FieldRenderer({ component, values, onChange, onFileSelected }: Props) {
  const entry = catalogEntryFor(component.type);
  if (!entry) {
    console.warn(`[kyc-onboarding] dropping unknown component type "${component.type}" (RT-002)`);
    return null;
  }

  const parsed = entry.propsSchema.safeParse(component.properties);
  if (!parsed.success) {
    console.warn(`[kyc-onboarding] dropping "${component.type}" with invalid props (RT-003):`, parsed.error.message);
    return <p role="alert">A field couldn't be shown (invalid data).</p>;
  }

  const Component = entry.Component;
  const fieldId = (component.properties.fieldId as string | undefined) ?? component.id;

  if (entry.kind === "display") {
    return <Component {...parsed.data} />;
  }
  if (entry.kind === "boolean") {
    return (
      <Component
        {...parsed.data}
        checked={Boolean(values[fieldId])}
        onChange={(checked: boolean) => onChange(fieldId, checked)}
      />
    );
  }
  const currentValue = typeof values[fieldId] === "string" ? (values[fieldId] as string) : "";
  if (entry.kind === "file") {
    return (
      <Component
        {...parsed.data}
        value={currentValue}
        onChange={(filename: string) => onFileSelected?.(fieldId, filename)}
      />
    );
  }
  return <Component {...parsed.data} value={currentValue} onChange={(value: string) => onChange(fieldId, value)} />;
}

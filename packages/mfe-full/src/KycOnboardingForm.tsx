// SLIDE: "A2UI: agents declare UI as data" (the rendered form next to the live blueprint response)
import { useEffect, useState } from "react";
import { MessageProcessor } from "@a2ui/web_core";
import type { Geo } from "@kyc/contracts";
import { fetchFeatures } from "@kyc/core";
import { a2uiCatalog, catalogEntryFor } from "./catalog.js";
import { fetchBlueprint } from "./blueprint.js";

interface Props {
  geo: Geo;
  apiBase: string;
}

interface RenderedComponent {
  id: string;
  type: string;
  properties: Record<string, unknown>;
}

export function KycOnboardingForm({ geo, apiBase }: Props) {
  const [components, setComponents] = useState<RenderedComponent[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await fetchFeatures(geo, apiBase); // RT-004/FLG-001: fetched once per session, read via the core adapter
        const messages = await fetchBlueprint(geo, apiBase);

        const processor = new MessageProcessor([a2uiCatalog]);
        processor.processMessages(messages as never);

        const surfaceId = `${geo}-personal-details`;
        const surface = processor.model.getSurface(surfaceId);
        if (!surface) throw new Error("blueprint did not create the expected surface");

        const rendered: RenderedComponent[] = [...surface.componentsModel.values].map((component) => ({
          id: component.id,
          type: component.type,
          properties: component.properties,
        }));

        if (!cancelled) setComponents(rendered);
      } catch (cause) {
        if (!cancelled) setError(String(cause));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [geo, apiBase]);

  if (error) return <p role="alert">Couldn't load this form: {error}</p>;
  if (!components) return <p aria-live="polite">Loading…</p>;

  return (
    <form>
      <p>
        <em>Illustrative rules: demo only</em>
      </p>
      {components.map((component) => {
        const entry = catalogEntryFor(component.type);
        if (!entry) {
          console.warn(`[kyc-onboarding] dropping unknown component type "${component.type}" (RT-002)`);
          return null;
        }
        const Component = entry.Component;
        return (
          <Component
            key={component.id}
            {...component.properties}
            value={values[component.id] ?? ""}
            onChange={(value: string) => setValues((prev) => ({ ...prev, [component.id]: value }))}
          />
        );
      })}
    </form>
  );
}

// SLIDE: "Zero-trust UI: data, not code" (the browser's own copy of the allowlist — RT-002/RT-003)
import { Catalog, type ComponentApi, type SurfaceModel } from "@a2ui/web_core";
import { CATALOG, type CatalogEntry } from "@kyc/catalog";
import { A2UI_CATALOG_ID, A2UI_PROTOCOL_VERSION } from "@kyc/contracts";

const componentApis: ComponentApi[] = Object.values(CATALOG).map((entry) => ({
  name: entry.name,
  schema: entry.propsSchema,
}));

export const a2uiCatalog = new Catalog(A2UI_CATALOG_ID, A2UI_PROTOCOL_VERSION, componentApis);

export function catalogEntryFor(type: string): CatalogEntry | undefined {
  return (CATALOG as Record<string, CatalogEntry>)[type];
}

export type { SurfaceModel };

// SLIDE: "Zero-trust UI: data, not code" (every recorded blueprint still has to satisfy the real A2UI schema)
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { describe, it, expect } from "vitest";
import { MessageProcessor, Catalog, type ComponentApi } from "@a2ui/web_core";
import { CATALOG } from "@kyc/catalog";
import { GeoSchema, FeaturesResponseSchema, A2UI_CATALOG_ID, A2UI_PROTOCOL_VERSION } from "@kyc/contracts";
import { computePolicy } from "@kyc/core";
import { gbFeatures, inFeatures, aeFeatures, sgFeatures } from "@kyc/mocks";

const RECORDED_DIR = join(process.cwd(), "../packages/mocks/a2ui/recorded");
const FIXTURES = { GB: gbFeatures, IN: inFeatures, AE: aeFeatures, SG: sgFeatures } as const;

const componentApis: ComponentApi[] = Object.values(CATALOG).map((entry) => ({ name: entry.name, schema: entry.propsSchema }));
const testCatalog = new Catalog(A2UI_CATALOG_ID, A2UI_PROTOCOL_VERSION, componentApis);

function readRecording(file: string): unknown[] {
  return readFileSync(join(RECORDED_DIR, file), "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
}

describe("recorded blueprints", () => {
  const files = readdirSync(RECORDED_DIR).filter((f) => f.endsWith(".jsonl"));

  it("[RT-008] a recording exists for every geo", () => {
    for (const geo of GeoSchema.options) {
      expect(files).toContain(`${geo}.jsonl`);
    }
  });

  for (const file of files) {
    const geo = file.replace(".jsonl", "");

    it(`[RT-005] every message in ${file} is accepted by the real MessageProcessor`, () => {
      // Exercises the same public validation surface the browser uses (RT-005),
      // rather than reaching into @a2ui/web_core's unexported internal schemas.
      const processor = new MessageProcessor([testCatalog]);
      expect(() => processor.processMessages(readRecording(file) as never)).not.toThrow();
    });

    it(`[RT-002] every component in ${file} is in the catalog allowlist`, () => {
      for (const message of readRecording(file)) {
        const components = (message as { updateComponents?: { components?: { component: string }[] } }).updateComponents
          ?.components;
        for (const component of components ?? []) {
          expect(Object.keys(CATALOG)).toContain(component.component);
        }
      }
    });

    it(`[RT-004] every field-bearing component's fieldId is one of ${geo}'s policy fields`, () => {
      const features = FeaturesResponseSchema.parse(FIXTURES[geo as keyof typeof FIXTURES]);
      const policyFieldIds = computePolicy(features).fields.map((f) => f.fieldId);
      for (const message of readRecording(file)) {
        const components = (message as { updateComponents?: { components?: Record<string, unknown>[] } }).updateComponents
          ?.components;
        for (const component of components ?? []) {
          if (typeof component.fieldId === "string") {
            expect(policyFieldIds).toContain(component.fieldId);
          }
        }
      }
    });
  }
});

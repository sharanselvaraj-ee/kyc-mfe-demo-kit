// SLIDE: "Anatomy of a living spec" (FLG-003: every fixture is enforced by this schema)
import { z } from "zod";

export const GeoSchema = z.enum(["GB", "IN", "AE", "SG"]);
export type Geo = z.infer<typeof GeoSchema>;

export const FeaturesConfigSchema = z.object({
  minAgeYears: z.number().int().positive(),
  postcodePattern: z.string().nullable(),
  nationalIdPattern: z.string().nullable(),
  documentTypes: z.array(z.string()),
});

export const FeaturesResponseSchema = z.object({
  geo: GeoSchema,
  schemaVersion: z.literal(1),
  flags: z.record(z.string(), z.boolean()),
  config: FeaturesConfigSchema,
});

export type FeaturesResponse = z.infer<typeof FeaturesResponseSchema>;

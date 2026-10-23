// SLIDE: "Anatomy of a living spec" (the mocked KYC API's request/response contracts)
import { z } from "zod";
import { GeoSchema } from "./features.js";

export const UploadResponseSchema = z.object({ documentId: z.string() });
export type UploadResponse = z.infer<typeof UploadResponseSchema>;

export const PrefillResponseSchema = z.object({
  name: z.string(),
  dateOfBirth: z.string(),
  nationalId: z.string().optional(),
});
export type PrefillResponse = z.infer<typeof PrefillResponseSchema>;

/** [ONB-SUBMIT-001] Only the fields the geo's policy required end up in `values`. */
export const KycSubmissionSchema = z.object({
  geo: GeoSchema,
  values: z.record(z.string(), z.string()),
  consent: z.literal(true),
});
export type KycSubmission = z.infer<typeof KycSubmissionSchema>;

export const SubmissionResponseSchema = z.object({ referenceId: z.string() });
export type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;

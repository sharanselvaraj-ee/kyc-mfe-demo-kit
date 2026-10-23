// SLIDE: "Two cadences, one architecture: shell and slot" (MFE-002: events carry no personal data)
export type KycEventName = "kyc:ready" | "kyc:step" | "kyc:submitted" | "kyc:error" | "kyc:contract-warning";

export interface KycEventPayloads {
  "kyc:ready": { geo: string; variant: "full" | "lite" };
  "kyc:step": { step: string; index: number; total: number };
  "kyc:submitted": { referenceId: string; geo: string };
  "kyc:error": { code: string; recoverable: boolean };
  "kyc:contract-warning": { flag: string; geo: string; scenarioId: string };
}

export type EventEmitter = <Name extends KycEventName>(name: Name, detail: KycEventPayloads[Name]) => void;

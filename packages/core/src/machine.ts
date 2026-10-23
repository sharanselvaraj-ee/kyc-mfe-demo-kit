// SLIDE: "Headless core: logic without a framework" (the step machine — forward validates only the current step, ONB-FLOW-001)
import type { FeaturesResponse } from "@kyc/contracts";
import { validateField, type Values } from "./validation.js";

export interface StepDefinition {
  id: string;
  title: string;
  fieldIds: string[];
}

export interface MachineState {
  stepIndex: number;
}

export const initialMachineState: MachineState = { stepIndex: 0 };

export function canGoBack(state: MachineState): boolean {
  return state.stepIndex > 0;
}

export function isLastStep(state: MachineState, steps: StepDefinition[]): boolean {
  return state.stepIndex >= steps.length - 1;
}

export function goBack(state: MachineState): MachineState {
  return { stepIndex: Math.max(0, state.stepIndex - 1) };
}

/** [ONB-FLOW-001] Only the current step's fields are validated; later steps are untouched. */
export function validateStep(
  step: StepDefinition,
  values: Values,
  features: FeaturesResponse,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const fieldId of step.fieldIds) {
    const value = values[fieldId];
    const error = validateField(fieldId, typeof value === "string" ? value : "", features);
    if (error) errors[fieldId] = error;
  }
  return errors;
}

/** Advances only when the current step has no validation errors. */
export function tryAdvance(
  state: MachineState,
  steps: StepDefinition[],
  values: Values,
  features: FeaturesResponse,
): { state: MachineState; errors: Record<string, string> } {
  const step = steps[state.stepIndex];
  if (!step) return { state, errors: {} };
  const errors = validateStep(step, values, features);
  if (Object.keys(errors).length > 0) {
    return { state, errors };
  }
  return { state: { stepIndex: Math.min(state.stepIndex + 1, steps.length - 1) }, errors: {} };
}

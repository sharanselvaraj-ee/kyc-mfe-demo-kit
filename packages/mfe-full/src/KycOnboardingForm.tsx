// SLIDE: "A2UI: agents declare UI as data" (the rendered form next to the live blueprint response)
import { useEffect, useState } from "react";
import { MessageProcessor } from "@a2ui/web_core";
import type { Geo } from "@kyc/contracts";
import { fetchFeatures, computePolicy, initialMachineState, tryAdvance, goBack, type Values } from "@kyc/core";
import { requestOtp, fetchPrefill, uploadDocument, submitKyc, isGovPrefillAvailable } from "@kyc/core";
import { a2uiCatalog } from "./catalog.js";
import { fetchBlueprint } from "./blueprint.js";
import { FieldRenderer, type RenderedComponent } from "./FieldRenderer.js";
import { ReviewStep } from "./ReviewStep.js";
import type { EventEmitter } from "./events.js";
import type { BlueprintFetchResult } from "./blueprint.js";

interface Props {
  geo: Geo;
  apiBase: string;
  injectUnknownComponent: boolean;
  onEvent: EventEmitter;
  /** Dev-panel only (not one of the MFE-002 events): raw agent response headers. */
  onAgentResponse?: (headers: BlueprintFetchResult["headers"]) => void;
}

interface Step {
  title: string;
  components: RenderedComponent[];
}

export function KycOnboardingForm({ geo, apiBase, injectUnknownComponent, onEvent, onAgentResponse }: Props) {
  const [phase, setPhase] = useState<"loading" | "error" | "form" | "review" | "submitted">("loading");
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [features, setFeatures] = useState<Awaited<ReturnType<typeof fetchFeatures>> | null>(null);
  const [machine, setMachine] = useState(initialMachineState);
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loadedFeatures = await fetchFeatures(geo, apiBase);
        const { messages, surfaceIds, headers } = await fetchBlueprint(geo, apiBase, { injectUnknownComponent });
        onAgentResponse?.(headers);

        const processor = new MessageProcessor([a2uiCatalog]);
        processor.processMessages(messages as never);

        const loadedSteps: Step[] = surfaceIds.map((surfaceId) => {
          const surface = processor.model.getSurface(surfaceId);
          const all = surface ? [...surface.componentsModel.values].map((c) => ({ id: c.id, type: c.type, properties: c.properties })) : [];
          const heading = all.find((c) => c.type === "Heading");
          return { title: (heading?.properties.text as string) ?? "Details", components: all.filter((c) => c.id !== "heading") };
        });

        if (cancelled) return;
        setFeatures(loadedFeatures);
        setSteps(loadedSteps);
        setPhase("form");
        onEvent("kyc:ready", { geo, variant: "full" });
        onEvent("kyc:step", { step: loadedSteps[0]?.title ?? "", index: 0, total: loadedSteps.length + 1 });
      } catch (cause) {
        if (cancelled) return;
        const message = String(cause);
        setLoadError(message);
        setPhase("error");
        onEvent("kyc:error", { code: "blueprint_load_failed", recoverable: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [geo, apiBase, injectUnknownComponent]);

  if (phase === "loading") return <p aria-live="polite">Loading…</p>;
  if (phase === "error") return <p role="alert">Couldn't load this form: {loadError}</p>;
  if (!steps || !features) return null;

  const policy = computePolicy(features);
  const currentStep = steps[machine.stepIndex];
  const stepDefs = steps.map((s, i) => ({
    id: String(i),
    title: s.title,
    fieldIds: s.components.map((c) => (c.properties.fieldId as string) ?? c.id),
  }));

  function setField(fieldId: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (!(fieldId in prev)) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }

  /** [ONB-DOC-001] A short simulated delay, then a documentId; the filename is what's shown. */
  function handleFileSelected(fieldId: string, filename: string) {
    if (!filename) return setField(fieldId, "");
    setField(fieldId, `Uploading ${filename}…`);
    void uploadDocument(apiBase, filename).then(() => setField(fieldId, filename));
  }

  function announceStep(index: number, title: string) {
    onEvent("kyc:step", { step: title, index, total: steps!.length + 1 });
  }

  function handleContinue() {
    if (machine.stepIndex === steps!.length - 1) {
      const { errors: stepErrors } = tryAdvance(machine, stepDefs, values, features!);
      if (Object.keys(stepErrors).length > 0) return setErrors(stepErrors);
      setPhase("review");
      return announceStep(steps!.length, "Review & consent");
    }
    const { state, errors: stepErrors } = tryAdvance(machine, stepDefs, values, features!);
    if (Object.keys(stepErrors).length > 0) return setErrors(stepErrors);
    setMachine(state);
    announceStep(state.stepIndex, steps![state.stepIndex]?.title ?? "");
  }

  function handleBack() {
    if (phase === "review") {
      setPhase("form");
      return announceStep(machine.stepIndex, steps![machine.stepIndex]?.title ?? "");
    }
    const state = goBack(machine);
    setMachine(state);
    announceStep(state.stepIndex, steps![state.stepIndex]?.title ?? "");
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const submissionValues: Record<string, string> = {};
      for (const field of policy.fields) {
        const v = values[field.fieldId];
        if (typeof v === "string") submissionValues[field.fieldId] = v;
      }
      const result = await submitKyc(apiBase, { geo, values: submissionValues, consent: true });
      onEvent("kyc:submitted", { referenceId: result.referenceId, geo });
      setPhase("submitted");
    } catch {
      onEvent("kyc:error", { code: "submit_failed", recoverable: true });
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "submitted") return <p role="status">Submitted — thank you.</p>;

  const fieldIdsHere = currentStep?.components.map((c) => (c.properties.fieldId as string) ?? c.id) ?? [];
  const showPrefill = isGovPrefillAvailable(features) && fieldIdsHere.includes("name");
  const showOtpSend = fieldIdsHere.includes("otpCode");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleContinue();
      }}
    >
      <p>
        <em>Illustrative rules: demo only</em>
      </p>

      {phase === "review" ? (
        <ReviewStep
          policy={policy}
          values={values}
          consent={Boolean(values.consent)}
          onConsentChange={(checked) => setField("consent", checked)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      ) : (
        <section aria-label={currentStep?.title}>
          <h2>{currentStep?.title}</h2>
          {showPrefill ? (
            <button type="button" onClick={() => void fetchPrefill(apiBase).then((p) => {
              setField("name", p.name);
              setField("dateOfBirth", p.dateOfBirth);
              if (p.nationalId) setField("nationalId", p.nationalId);
            })}>
              Prefill from government record (demo)
            </button>
          ) : null}
          {currentStep?.components.map((component) => (
            <div key={component.id}>
              <FieldRenderer component={component} values={values} onChange={setField} onFileSelected={handleFileSelected} />
              {errors[(component.properties.fieldId as string) ?? component.id] ? (
                <p role="alert">{errors[(component.properties.fieldId as string) ?? component.id]}</p>
              ) : null}
            </div>
          ))}
          {showOtpSend ? (
            <button type="button" onClick={() => void requestOtp(apiBase)}>
              Send code (demo — use 123456)
            </button>
          ) : null}
        </section>
      )}

      <div>
        {machine.stepIndex > 0 || phase === "review" ? (
          <button type="button" onClick={handleBack}>
            Back
          </button>
        ) : null}
        {phase !== "review" ? <button type="submit">Continue</button> : null}
      </div>
    </form>
  );
}

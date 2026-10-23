// SLIDE: "Headless core: logic without a framework" (review & consent: core decides submission, not the agent)
import { useState } from "react";
import { CATALOG } from "@kyc/catalog";
import { validateConsent, type Policy, type Values } from "@kyc/core";

interface Props {
  policy: Policy;
  values: Values;
  consent: boolean;
  onConsentChange: (checked: boolean) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
}

export function ReviewStep({ policy, values, consent, onConsentChange, onSubmit, submitting }: Props) {
  const [consentError, setConsentError] = useState<string | null>(null);
  const Checkbox = CATALOG.CheckboxField.Component;

  return (
    <section aria-label="Review & consent">
      <h2>Review &amp; consent</h2>
      <dl>
        {policy.fields.map((field) => (
          <div key={field.fieldId}>
            <dt>{field.label}</dt>
            <dd>{String(values[field.fieldId] ?? "—")}</dd>
          </div>
        ))}
      </dl>
      <Checkbox
        fieldId="consent"
        label="I confirm this information is accurate"
        checked={consent}
        onChange={(checked: boolean) => {
          onConsentChange(checked);
          setConsentError(null);
        }}
      />
      {consentError ? <p role="alert">{consentError}</p> : null}
      <button
        type="button"
        disabled={submitting}
        onClick={() => {
          const error = validateConsent(consent);
          if (error) {
            setConsentError(error);
            return;
          }
          void onSubmit();
        }}
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </section>
  );
}

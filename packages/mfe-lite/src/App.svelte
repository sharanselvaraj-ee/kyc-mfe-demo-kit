<svelte:options
  customElement={{
    tag: "kyc-onboarding-lite",
    shadow: "none",
    props: { apiBase: { attribute: "api-base" } },
  }}
/>

<script>
  // SLIDE: "Runtime streaming vs static compilation" (no agent call at runtime — LITE-003)
  import { onMount } from "svelte";
  import { MessageProcessor } from "@a2ui/web_core";
  import { fetchFeatures, computePolicy, initialMachineState, tryAdvance, goBack, validateConsent, submitKyc } from "@kyc/core";
  import { liteCatalog, SVELTE_COMPONENTS, kindOf, propsSchemaFor } from "./catalog.js";
  import blueprintText from "./blueprint.generated.jsonl?raw";

  export let geo = "IN";
  export let apiBase = "/api";

  let phase = "loading";
  let loadError = "";
  let features = null;
  let policy = null;
  let steps = [];
  let machine = initialMachineState;
  let values = {};
  let errors = {};
  let reviewing = false;
  let submitting = false;
  let consent = false;

  onMount(async () => {
    try {
      features = await fetchFeatures(geo, apiBase);
      policy = computePolicy(features);

      const messages = blueprintText
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line));

      const processor = new MessageProcessor([liteCatalog]);
      processor.processMessages(messages);

      const surfaceIds = messages
        .map((message) => message.createSurface?.surfaceId)
        .filter((id) => Boolean(id));

      steps = surfaceIds.map((surfaceId) => {
        const surface = processor.model.getSurface(surfaceId);
        const all = surface
          ? [...surface.componentsModel.values].map((c) => ({ id: c.id, type: c.type, properties: c.properties }))
          : [];
        const heading = all.find((c) => c.type === "Heading");
        return { title: heading?.properties.text ?? "Details", components: all.filter((c) => c.id !== "heading") };
      });

      phase = "form";
    } catch (cause) {
      loadError = String(cause);
      phase = "error";
    }
  });

  function fieldIdFor(component) {
    return component.properties.fieldId ?? component.id;
  }

  function setField(fieldId, value) {
    values = { ...values, [fieldId]: value };
    if (fieldId in errors) {
      const next = { ...errors };
      delete next[fieldId];
      errors = next;
    }
  }

  $: currentStep = steps[machine.stepIndex];
  $: stepDefs = steps.map((s, i) => ({ id: String(i), title: s.title, fieldIds: s.components.map(fieldIdFor) }));

  function handleContinue() {
    if (machine.stepIndex === steps.length - 1) {
      const { errors: stepErrors } = tryAdvance(machine, stepDefs, values, features);
      if (Object.keys(stepErrors).length > 0) {
        errors = stepErrors;
        return;
      }
      reviewing = true;
      return;
    }
    const { state, errors: stepErrors } = tryAdvance(machine, stepDefs, values, features);
    if (Object.keys(stepErrors).length > 0) {
      errors = stepErrors;
      return;
    }
    machine = state;
  }

  function handleBack() {
    if (reviewing) {
      reviewing = false;
      return;
    }
    machine = goBack(machine);
  }

  let consentError = "";
  async function handleSubmit() {
    const error = validateConsent(consent);
    if (error) {
      consentError = error;
      return;
    }
    submitting = true;
    try {
      const submissionValues = {};
      for (const field of policy.fields) {
        const v = values[field.fieldId];
        if (typeof v === "string") submissionValues[field.fieldId] = v;
      }
      await submitKyc(apiBase, { geo, values: submissionValues, consent: true });
      phase = "submitted";
    } catch {
      loadError = "Submission failed";
    } finally {
      submitting = false;
    }
  }
</script>

<p><em>Illustrative rules: demo only (lite)</em></p>

{#if phase === "loading"}
  <p aria-live="polite">Loading…</p>
{:else if phase === "error"}
  <p role="alert">Couldn't load this form: {loadError}</p>
{:else if phase === "submitted"}
  <p role="status">Submitted — thank you.</p>
{:else if reviewing}
  <section aria-label="Review & consent">
    <h2>Review &amp; consent</h2>
    <dl>
      {#each policy.fields as field (field.fieldId)}
        <dt>{field.label}</dt>
        <dd>{values[field.fieldId] ?? "—"}</dd>
      {/each}
    </dl>
    <input
      id="consent"
      type="checkbox"
      checked={consent}
      on:change={(e) => {
        consent = e.target.checked;
        consentError = "";
      }}
    />
    <label for="consent">I confirm this information is accurate</label>
    {#if consentError}<p role="alert">{consentError}</p>{/if}
    <div>
      <button type="button" on:click={handleBack}>Back</button>
      <button type="button" disabled={submitting} on:click={handleSubmit}>
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </div>
  </section>
{:else}
  <section aria-label={currentStep?.title}>
    <h2>{currentStep?.title}</h2>
    {#each currentStep?.components ?? [] as component (component.id)}
      {@const fieldId = fieldIdFor(component)}
      {@const kind = kindOf(component.type)}
      {@const Component = SVELTE_COMPONENTS[component.type]}
      {@const parsed = propsSchemaFor(component.type)?.safeParse(component.properties)}
      <div>
        {#if !Component || !parsed?.success}
          <p role="alert">A field couldn't be shown.</p>
        {:else if kind === "display"}
          <svelte:component this={Component} {...parsed.data} />
        {:else if kind === "boolean"}
          <svelte:component
            this={Component}
            {...parsed.data}
            checked={Boolean(values[fieldId])}
            onChange={(v) => setField(fieldId, v)}
          />
        {:else}
          <svelte:component
            this={Component}
            {...parsed.data}
            value={typeof values[fieldId] === "string" ? values[fieldId] : ""}
            onChange={(v) => setField(fieldId, v)}
          />
        {/if}
        {#if errors[fieldId]}<p role="alert">{errors[fieldId]}</p>{/if}
      </div>
    {/each}
    <div>
      {#if machine.stepIndex > 0}<button type="button" on:click={handleBack}>Back</button>{/if}
      <button type="button" on:click={handleContinue}>Continue</button>
    </div>
  </section>
{/if}

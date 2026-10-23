// SLIDE: "Two cadences, one architecture: shell and slot" (<kyc-onboarding>, the slot the host embeds)
import { createRoot, type Root } from "react-dom/client";
import { GeoSchema, type Geo } from "@kyc/contracts";
import { KycOnboardingForm } from "./KycOnboardingForm.js";

class KycOnboardingElement extends HTMLElement {
  static observedAttributes = ["geo", "api-base"];

  #root: Root | null = null;

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    this.#render();
  }

  disconnectedCallback() {
    this.#root?.unmount();
    this.#root = null;
  }

  #render() {
    const geoResult = GeoSchema.safeParse(this.getAttribute("geo"));
    if (!geoResult.success) {
      this.textContent = `<kyc-onboarding> needs a valid geo attribute (GB, IN, AE or SG)`;
      return;
    }
    const geo: Geo = geoResult.data;
    const apiBase = this.getAttribute("api-base") ?? "/api";

    this.#root ??= createRoot(this);
    this.#root.render(<KycOnboardingForm geo={geo} apiBase={apiBase} />);
  }
}

if (!customElements.get("kyc-onboarding")) {
  customElements.define("kyc-onboarding", KycOnboardingElement);
}

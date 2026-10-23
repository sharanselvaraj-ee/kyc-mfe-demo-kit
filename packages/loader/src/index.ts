// SLIDE: "Two cadences, one architecture: shell and slot" (the loader: picks full vs lite, injects the bundle)
import { chooseVariant } from "./choose-variant.js";

type NavigatorConnection = { saveData?: boolean; effectiveType?: string };

function getConnection(): NavigatorConnection | undefined {
  return (navigator as unknown as { connection?: NavigatorConnection }).connection;
}

/** Runs once per page load: finds every `<kyc-onboarding>`, decides full vs lite, and loads only that bundle. */
export async function initLoader(): Promise<void> {
  const elements = document.querySelectorAll("kyc-onboarding");
  if (elements.length === 0) return;

  let needsFull = false;
  let needsLite = false;

  for (const element of elements) {
    const geo = element.getAttribute("geo");
    const variant = element.getAttribute("variant");
    const chosen = chooseVariant(geo, variant, getConnection(), window.location.search);

    if (chosen === "lite") {
      needsLite = true;
      const lite = document.createElement("kyc-onboarding-lite");
      for (const attr of Array.from(element.attributes)) {
        lite.setAttribute(attr.name, attr.value);
      }
      element.replaceWith(lite);
    } else {
      needsFull = true;
    }
  }

  if (needsFull) await import("@kyc/mfe-full");
  if (needsLite) await import("@kyc/mfe-lite");
}

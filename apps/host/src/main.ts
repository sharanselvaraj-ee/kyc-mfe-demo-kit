// SLIDE: "Two cadences, one architecture: shell and slot" (the host owns the shell; this is the dummy host)
import { worker } from "@kyc/mocks/browser";
import { initLoader } from "@kyc/loader";

const slowNetwork = document.getElementById("slow-network") as HTMLInputElement;
if (slowNetwork.checked) {
  // [LITE-001] Simulates a real signal (navigator.connection), not a dev-only
  // backdoor — the loader reads the exact same property in production.
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: { saveData: false, effectiveType: "2g" },
  });
}

await worker.start({ onUnhandledRequest: "bypass" });
await initLoader();

const geoSelect = document.getElementById("geo-select") as HTMLSelectElement;
const injectUnknown = document.getElementById("inject-unknown") as HTMLInputElement;
const headersEl = document.getElementById("agent-headers")!;
const logEl = document.getElementById("event-log")!;

function currentElement(): HTMLElement {
  return document.getElementById("kyc")!;
}

geoSelect.addEventListener("change", () => currentElement().setAttribute("geo", geoSelect.value));
injectUnknown.addEventListener("change", () =>
  currentElement().setAttribute("inject-unknown-component", String(injectUnknown.checked)),
);
slowNetwork.addEventListener("change", () => {
  const url = new URL(window.location.href);
  if (slowNetwork.checked) url.searchParams.set("kyc-lite", "1");
  else url.searchParams.delete("kyc-lite");
  window.location.href = url.toString();
});

function logEvent(name: string, detail: unknown) {
  const li = document.createElement("li");
  const time = new Date().toLocaleTimeString();
  li.textContent = `[${time}] ${name} ${JSON.stringify(detail)}`;
  logEl.prepend(li);
}

for (const name of ["kyc:ready", "kyc:step", "kyc:submitted", "kyc:error", "kyc:contract-warning"]) {
  currentElement().addEventListener(name, (event) => logEvent(name, (event as CustomEvent).detail));
}

currentElement().addEventListener("kyc:dev-agent-response", (event) => {
  const headers = (event as CustomEvent).detail as Record<string, string | null>;
  headersEl.innerHTML = Object.entries(headers)
    .map(([key, value]) => `<dt>${key}</dt><dd>${value ?? "—"}</dd>`)
    .join("");
});

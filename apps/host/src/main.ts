// SLIDE: "Two cadences, one architecture: shell and slot" (the host owns the shell; this is the dummy host)
import { worker } from "@kyc/mocks/browser";

await worker.start({ onUnhandledRequest: "bypass" });
await import("@kyc/mfe-full");

const element = document.getElementById("kyc")!;
const geoSelect = document.getElementById("geo-select") as HTMLSelectElement;
const injectUnknown = document.getElementById("inject-unknown") as HTMLInputElement;
const headersEl = document.getElementById("agent-headers")!;
const logEl = document.getElementById("event-log")!;

geoSelect.addEventListener("change", () => element.setAttribute("geo", geoSelect.value));
injectUnknown.addEventListener("change", () =>
  element.setAttribute("inject-unknown-component", String(injectUnknown.checked)),
);

function logEvent(name: string, detail: unknown) {
  const li = document.createElement("li");
  const time = new Date().toLocaleTimeString();
  li.textContent = `[${time}] ${name} ${JSON.stringify(detail)}`;
  logEl.prepend(li);
}

for (const name of ["kyc:ready", "kyc:step", "kyc:submitted", "kyc:error", "kyc:contract-warning"]) {
  element.addEventListener(name, (event) => logEvent(name, (event as CustomEvent).detail));
}

element.addEventListener("kyc:dev-agent-response", (event) => {
  const headers = (event as CustomEvent).detail as Record<string, string | null>;
  headersEl.innerHTML = Object.entries(headers)
    .map(([key, value]) => `<dt>${key}</dt><dd>${value ?? "—"}</dd>`)
    .join("");
});

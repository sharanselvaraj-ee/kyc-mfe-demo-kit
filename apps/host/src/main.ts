// SLIDE: "Two cadences, one architecture: shell and slot" (the host owns the shell; this is the dummy host)
import { worker } from "@kyc/mocks/browser";

await worker.start({
  onUnhandledRequest: "bypass",
});

await import("@kyc/mfe-full");

// SLIDE: "Two cadences, one architecture: shell and slot" (LITE-001: the loader rule, pure and testable)
import { LITE_AVAILABLE_GEOS } from "./lite-manifest.generated.js";

export interface ConnectionInfo {
  saveData?: boolean;
  effectiveType?: string;
}

const SLOW_TYPES = new Set(["slow-2g", "2g", "3g"]);

/** [LITE-001] */
export function chooseVariant(
  geo: string | null,
  variantAttr: string | null,
  connection: ConnectionInfo | undefined,
  search: string,
): "full" | "lite" {
  if (variantAttr === "full") return "full";
  const geoEligible = geo !== null && LITE_AVAILABLE_GEOS.includes(geo);
  if (!geoEligible) return "full";

  const isSlow = connection?.saveData === true || (connection?.effectiveType !== undefined && SLOW_TYPES.has(connection.effectiveType));
  const forced = variantAttr === "lite" || new URLSearchParams(search).has("kyc-lite");
  return isSlow || forced ? "lite" : "full";
}

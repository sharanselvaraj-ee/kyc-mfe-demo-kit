// Shared between the agent (encodes createSurface.catalogId) and the browser
// (constructs its MessageProcessor's Catalog with the same id) so the two sides
// agree without a real catalog-negotiation handshake (see docs/VERSIONS.md).
export const A2UI_CATALOG_ID = "kyc-catalog-v1";
export const A2UI_PROTOCOL_VERSION = "v0.9" as const;

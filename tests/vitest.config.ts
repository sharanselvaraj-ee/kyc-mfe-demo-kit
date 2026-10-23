import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [react(), svelte({ compilerOptions: { runes: false } })],
  resolve: {
    // Svelte's package exports a server build by default; force the client
    // build so component tests actually mount in jsdom instead of SSR-rendering.
    conditions: ["browser"],
  },
  test: {
    environment: "jsdom",
    include: ["primitives/**/*.spec.ts", "primitives/**/*.spec.tsx", "contracts/**/*.spec.ts"],
    globals: false,
  },
});

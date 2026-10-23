import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    react(),
    svelte({
      compilerOptions: {
        runes: false,
        // Only mfe-lite's own App.svelte declares <svelte:options customElement=...>;
        // the Mitosis-generated primitives it renders are plain (non-custom-element) components.
        customElement: ({ filename }) => filename.endsWith("mfe-lite/src/App.svelte"),
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api/agent": {
        target: `http://localhost:${process.env.KYC_AGENT_PORT ?? 8787}`,
        changeOrigin: true,
      },
    },
  },
});

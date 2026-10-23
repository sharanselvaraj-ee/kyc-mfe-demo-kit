import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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

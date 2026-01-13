import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "nested-markdown": fileURLToPath(
        new URL("../../src/index.ts", import.meta.url)
      ),
    },
  },
  server: {
    port: 5173,
  },
});

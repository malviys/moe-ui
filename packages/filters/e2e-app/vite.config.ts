import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This config is used by the `e2e:serve` script.
// Vite is invoked from the package root, and the root is overridden to e2e-app/
// so that index.html is picked up correctly.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,
  },
});

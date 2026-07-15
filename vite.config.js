import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => ({
  // Vercel serves the full site at `/`. GitHub Pages supplies VITE_BASE_PATH
  // in its workflow because it hosts the public fallback below a repo path.
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
}));

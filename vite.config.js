import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project below the repository name. Keep the
  // development server at `/` so existing localhost URLs continue to work.
  base: command === "build" ? "/aurora-esports-studio/" : "/",
  plugins: [react(), tailwindcss()],
}));

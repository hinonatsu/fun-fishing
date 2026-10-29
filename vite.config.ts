import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/fun-fishing/",
  plugins: [tailwindcss()],
  esbuild: { jsx: "automatic" },
});

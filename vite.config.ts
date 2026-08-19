import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        "sharp",
      ],
    },
  },
  plugins: [
    // @ts-ignore remove this when the fresh plugin fixes the issue with the types
    fresh(),
    tailwindcss(),
  ],
});

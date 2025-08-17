import "./config.ts";

import { defineConfig } from "$fresh/server.ts";
import { i18n } from "$plugins/i18n/mod.ts";
import { kv } from "$services/kv.ts";
import tailwind from "@pakornv/fresh-plugin-tailwindcss";
import { ensureDir } from "@std/fs";
import { appConfig } from "./config.ts";
import supportedLanguages, { defaultLanguage } from "./languages.ts";
import { migrate } from "./migrate.ts";
import migrations from "./migrations.ts";

await migrate(migrations, kv);

await ensureDir(appConfig.uploadDir);

function cleanup() {
  Deno.exit();
}

Deno.addSignalListener("SIGINT", cleanup);
Deno.addSignalListener("SIGTERM", cleanup);

export default defineConfig({
  plugins: [
    tailwind(),
    i18n<typeof supportedLanguages>({
      defaultLanguage: defaultLanguage.code,
      languages: supportedLanguages,
      languagesDir: `${import.meta.dirname}/translations`,
    }),
  ],
  server: {
    port: 3000,
  },
});

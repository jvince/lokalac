import { defineConfig, RenderFunction } from "$fresh/server.ts";
import { context } from "$plugins/context/mod.ts";
import { cookies } from "$plugins/cookies/mod.ts";
import { i18n } from "$plugins/i18n/mod.ts";
import "$std/dotenv/load.ts";
import tailwind from "@pakornv/fresh-plugin-tailwindcss";
import { Context } from "./globalContext.ts";
import { migrate } from "./migrate.ts";
import migrations from "./migrations.ts";

const env = Deno.env.toObject();

const abortController = new AbortController();

await migrate(migrations);
function cleanup() {
  Deno.exit();
}

Deno.addSignalListener("SIGINT", cleanup);
Deno.addSignalListener("SIGTERM", cleanup);

export default defineConfig({
  plugins: [
    tailwind(),
    cookies(),
    i18n({
      defaultLanguage: "rs",
      languages: ["rs", "hu"],
      languagesDir: "./translations",
    }),
    context(
      Context,
      new URL("./globalContext.ts", import.meta.url).href,
    ),
  ],
  server: {
    signal: abortController.signal,
  },
});

import "@/config.ts";

import { appConfig } from "@/config.ts";
import { globalContext } from "@/globalContext.ts";
import supportedLanguages, { defaultLanguage } from "@/languages.ts";
import { migrate } from "@/migrate.ts";
import migrations from "@/migrations.ts";
import { i18n } from "@/plugins/i18n/mod.ts";
import { kv } from "@/services/kv.ts";
import { AppState, define } from "@/types/app.ts";
import { ensureDir } from "@std/fs";
import { App, cors, csrf, staticFiles } from "fresh";

export const app = new App<AppState>();

await migrate(migrations, kv);
await ensureDir(appConfig.uploadDir);

app.use(cors());
app.use(csrf());
app.use(staticFiles());

app.use(define.middleware(async (ctx) => {
  if (ctx.url.pathname === "/") {
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/issues",
      },
    });
  }

  if (ctx.url.pathname.startsWith(`/${appConfig.uploadDir}/`)) {
    const file = await Deno.open(`.${ctx.url.pathname}`);

    return new Response(file.readable, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  }

  return ctx.next();
}));

app.use(i18n<typeof supportedLanguages, AppState>({
  defaultLanguage: defaultLanguage.code,
  languages: supportedLanguages,
  languagesDir: "./translations",
})).use(globalContext());

// this is the same as the /api/:name route defined via a file. feel free to delete this!
app.get("/api2/:name", (ctx) => {
  const name = ctx.params.name;
  return new Response(
    `Hello, ${name.charAt(0).toUpperCase() + name.slice(1)}!`,
  );
});

// this can also be defined via a file. feel free to delete this!
const exampleLoggerMiddleware = define.middleware((ctx) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  return ctx.next();
});
app.use(exampleLoggerMiddleware);

// Include file-system based routes here
app.fsRoutes();

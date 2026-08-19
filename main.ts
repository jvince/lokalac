import "@/config.ts";

import { appConfig } from "@/config.ts";
import { globalContext } from "@/globalContext.ts";
import supportedLanguages, { defaultLanguage } from "@/languages.ts";
import { migrate } from "@/migrate.ts";
import migrations from "@/migrations.ts";
import { repairIssueIndexes } from "@/models/issue.ts";
import { i18n } from "@/plugins/i18n/mod.ts";
import { kv } from "@/services/kv.ts";

import { serveUpload } from "@/middleware/serveUpload.ts";
import { AppState, define } from "@/types/app.ts";
import { ensureDir } from "@std/fs";
import { App, cors, csrf, staticFiles } from "fresh";

export const app = new App<AppState>();

await migrate(migrations, kv);
await repairIssueIndexes(kv);
await ensureDir(appConfig.uploadDir);

app.use(cors());
app.use(csrf());
app.use(staticFiles());

app.use(define.middleware((ctx) => {
  if (ctx.url.pathname === "/") {
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/issues",
      },
    });
  }

  return ctx.next();
}));

app.use(serveUpload({ uploadDir: appConfig.uploadDir }));

app.use(i18n<typeof supportedLanguages, AppState>({
  defaultLanguage: defaultLanguage.code,
  languages: supportedLanguages,
  languagesDir: "./translations",
})).use(globalContext());

// Include file-system based routes here
app.fsRoutes();

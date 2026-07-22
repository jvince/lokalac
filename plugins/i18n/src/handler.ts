import { join } from "@std/path";
import type { Middleware } from "fresh";
import type { i18nLanguage, i18nPluginConfig } from "./types.ts";
import { i18nState } from "./types.ts";

async function readJSONFile(path: string): Promise<Record<string, string>> {
  try {
    const data = await Deno.readTextFile(path);
    return JSON.parse(data);
  } catch {
    console.error(`Error reading JSON file at ${path}.`);
    return {};
  }
}

async function loadTranslations(
  rootDir: string,
  translationPackage: string,
  language: string,
) {
  const translationPath = join(rootDir, language, `${translationPackage}.json`);
  return await readJSONFile(translationPath);
}

export function createHandler<State extends i18nState>(
  config: i18nPluginConfig,
): Middleware<State> {
  console.debug("i18n plugin handler created with config:", config);

  const { defaultLanguage, languages, languagesDir } = config;

  if (languages.find((lang) => lang.code !== defaultLanguage) === undefined) {
    throw new Error(
      `Default language "${defaultLanguage}" not found in the provided languages.`,
    );
  }

  const languageMap = new Map(
    languages.map((lang) => [lang.code, lang]),
  );

  return async (ctx) => {
    const { req } = ctx;

    const urlLang = new URL(req.url).searchParams.get("lang");
    const languageObj = languageMap.get(urlLang || "") ??
      languageMap.get(defaultLanguage) as i18nLanguage;

    ctx.state.language = languageObj;
    ctx.state.translation = {};

    ctx.state.translation.common = await loadTranslations(
      languagesDir,
      "common",
      languageObj.package,
    );

    return await ctx.next();
  };
}

import { join } from "@std/path";
import type { Middleware } from "fresh";
import type {
  i18nLanguage,
  i18nPluginConfig,
  i18nTranslationPackage,
} from "./types.ts";
import { i18nState } from "./types.ts";

export function createTranslationLoader(
  readTextFile: (path: string) => Promise<string> = Deno.readTextFile,
) {
  const cache = new Map<string, Promise<i18nTranslationPackage>>();

  return (
    rootDir: string,
    translationPackage: string,
    language: string,
  ): Promise<i18nTranslationPackage> => {
    const translationPath = join(
      rootDir,
      language,
      `${translationPackage}.json`,
    );
    let translation = cache.get(translationPath);

    if (!translation) {
      translation = readTextFile(translationPath)
        .then((data) => JSON.parse(data) as i18nTranslationPackage)
        .catch(() => {
          console.error(`Error reading JSON file at ${translationPath}.`);
          return {};
        });
      cache.set(translationPath, translation);
    }

    return translation;
  };
}

export function createHandler<State extends i18nState>(
  config: i18nPluginConfig,
): Middleware<State> {
  const { defaultLanguage, languages, languagesDir } = config;

  if (!languages.some((lang) => lang.code === defaultLanguage)) {
    throw new Error(
      `Default language "${defaultLanguage}" not found in the provided languages.`,
    );
  }

  const languageMap = new Map(
    languages.map((lang) => [lang.code, lang]),
  );
  const loadTranslations = createTranslationLoader();

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

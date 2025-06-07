import { i18nLanguage, i18nTranslation } from "$plugins/i18n/mod.ts";
import { get } from "@es-toolkit/es-toolkit/compat";
import { useGlobalContext } from "../globalContext.ts";
import supportedLanguages, { defaultLanguage } from "../supportedLanguages.ts";

function isValidValue(value: unknown) {
  return typeof value === "string" || typeof value === "number";
}

function t(this: i18nTranslation, key: string) {
  const result = get(this, key, key);

  return isValidValue(result) ? result : key;
}

function fromObject(
  this: i18nLanguage,
  object: object | null | undefined,
  key: string,
) {
  const { code } = this;

  if (code === defaultLanguage) {
    return get(object, key, key);
  }

  const translationKey = `${key}_${code.replaceAll("-", "_")}`;
  const result = get(object, translationKey, translationKey);
  return isValidValue(result) ? result : translationKey;
}

function createTranslator(translation: i18nTranslation) {
  return t.bind(translation);
}

function createTranslatorFromObject(language: i18nLanguage) {
  return fromObject.bind(language);
}

export function useTranslation() {
  const { language, translation } = useGlobalContext();
  const t = createTranslator(translation);
  const fromObject = createTranslatorFromObject(language);

  return {
    fromObject,
    language,
    supportedLanguages,
    t,
  };
}

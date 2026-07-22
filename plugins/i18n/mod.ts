import { defaultLanguage } from "@/languages.ts";
import { i18nLanguage, i18nTranslation } from "@/plugins/i18n/src/types.ts";
import { get } from "@es-toolkit/es-toolkit/compat";

export { i18n } from "./src/plugin.ts";

export type {
  i18nLanguage,
  i18nPluginConfig,
  i18nState,
  i18nTranslation,
} from "./src/types.ts";

export function isValidValue(value: unknown) {
  return typeof value === "string" || typeof value === "number";
}

export function t(this: i18nTranslation, key: string) {
  const result = get(this, key, key);

  return isValidValue(result) ? result : key;
}

export function fromObject(
  this: i18nLanguage,
  object: object | null | undefined,
  key: string,
) {
  const { code } = this;

  if (code === defaultLanguage.code) {
    return get(object, key, key);
  }

  const translationKey = `${key}_${code.replaceAll("-", "_")}`;
  const result = get(object, translationKey, translationKey);
  return isValidValue(result) ? result : translationKey;
}

export function createTranslator(translation: i18nTranslation) {
  return t.bind(translation);
}

export function createTranslatorFromObject(language: i18nLanguage) {
  return fromObject.bind(language);
}

import { useGlobalContext } from "@/clientGlobalContext.ts";
import supportedLanguages from "@/languages.ts";
import {
  createTranslator,
  createTranslatorFromObject,
} from "@/plugins/i18n/mod.ts";

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

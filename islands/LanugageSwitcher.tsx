import { IS_BROWSER } from "$fresh/runtime.ts";
import type { JSX } from "preact";
import { useTranslation } from "../hooks/useTranslation.ts";

export function LanguageSwitcher() {
  const { language, t, supportedLanguages } = useTranslation();

  const onChange = (event: JSX.TargetedEvent<HTMLSelectElement, Event>) => {
    const selectedLanguage = event.currentTarget.value;

    const url = new URL(globalThis.location.href);
    url.searchParams.set("lang", selectedLanguage);
    globalThis.location.assign(url.toString());
  };

  return (
    <form
      method={!IS_BROWSER ? "GET" : undefined}
      class="flex items-center gap-4"
    >
      <select name="lang" className="select" onChange={onChange}>
        {supportedLanguages.map((lang) => (
          <option
            selected={language.code === lang.code}
            value={lang.code}
          >
            {lang.localizedName}
          </option>
        ))}
      </select>
      {!IS_BROWSER && (
        <button class="animate-appear btn btn-small btn-soft" type="submit">
          {t("common.change_language")}
        </button>
      )}
    </form>
  );
}

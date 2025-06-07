import { useTranslation } from "$hooks/useTranslation.ts";
import { clsx } from "clsx/lite";
import IconLanguage from "https://deno.land/x/tabler_icons_tsx@0.0.7/tsx/language.tsx";
import { useGlobalContext } from "../globalContext.ts";
import { defaultLanguage } from "../languages.ts";

function getLanguageLinkProps(code: string, path: string) {
  if (code === defaultLanguage.code) {
    return path;
  }

  return `${path}?lang=${code}`;
}

export function LanguageSwitcher() {
  const { path } = useGlobalContext();
  const { t, supportedLanguages, language } = useTranslation();

  return (
    <div class="dropdown dropdown-end">
      <div
        id="test"
        class="btn btn-square btn-soft"
        role="button"
        tabIndex={0}
        title={t("common.change_language")}
      >
        <IconLanguage />
      </div>

      <ul class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
        {supportedLanguages.map((lang) => (
          <li>
            <a
              href={getLanguageLinkProps(lang.code, path)}
              class={clsx(
                lang.code === language.code && "menu-active",
              )}
            >
              {lang.localizedName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

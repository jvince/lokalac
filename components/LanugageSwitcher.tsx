import { useGlobalContext } from "@/globalContext.ts";
import { useTranslation } from "@/hooks/useTranslation.ts";
import { IconLanguage } from "@/icons.ts";
import { defaultLanguage } from "@/languages.ts";
import clsx from "clsx";

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
    <div data-language-switcher class="dropdown dropdown-end">
      <div
        id="test"
        class="btn btn-square btn-soft"
        role="button"
        tabIndex={0}
        title={t("common.change_language")}
      >
        <IconLanguage role="presentation" size={24} />
      </div>

      <ul class="menu dropdown-content bg-base-200 rounded-box z-1 w-52 p-2 gap-1.5 shadow-sm">
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

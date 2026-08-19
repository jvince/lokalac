import { useGlobalContext } from "@/globalContext.ts";
import { useTranslation } from "@/hooks/useTranslation.ts";
import { IconLanguage } from "@/icons.ts";
import { createLanguageSwitchUrl } from "@/utils/url.ts";
import clsx from "clsx";

export function LanguageSwitcher() {
  const { path } = useGlobalContext();
  const { t, supportedLanguages, language } = useTranslation();

  return (
    <div data-language-switcher class="dropdown dropdown-end">
      <div
        class="btn btn-square btn-soft"
        role="button"
        tabIndex={0}
        title={t("common.change_language")}
      >
        <IconLanguage role="presentation" size={24} />
      </div>

      <ul class="menu dropdown-content bg-base-200 rounded-box z-1 w-52 p-2 gap-1.5 shadow-sm">
        {supportedLanguages.map((lang) => (
          <li key={lang.code}>
            <a
              href={createLanguageSwitchUrl(path, lang.code)}
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

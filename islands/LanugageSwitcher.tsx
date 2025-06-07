import IconLanguage from "https://deno.land/x/tabler_icons_tsx@0.0.7/tsx/language.tsx";
import { useTranslation } from "../hooks/useTranslation.ts";
import { Link } from "../components/index.ts";

export function LanguageSwitcher() {
  const { language, t, supportedLanguages } = useTranslation();

  return (
    <div class="dropdown dropdown-end" title={t("common.change_language")}>
      <div tabIndex={0} role="button" class="btn btn-square btn-soft">
        <IconLanguage />
      </div>

      <ul tabindex={0} class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
        {supportedLanguages.map((lang) => (
          <li>
            <a
              href={`?lang=${lang.code}`}
            >
              {lang.localizedName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

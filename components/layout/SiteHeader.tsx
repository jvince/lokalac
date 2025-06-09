import { useTranslation } from "$hooks/useTranslation.ts";
import { LanguageSwitcher } from "../LanugageSwitcher.tsx";
import { Link } from "../Link.tsx";

export function SiteHeader() {
  const { t } = useTranslation();

  return (
    <header class="sticky top-4 mt-4 z-1">
      <nav class="navbar flex justify-between bg-base-200 shadow-sm">
        <ul class="flex space-x-4 px-8">
          <li>
            <Link href="/issues">
              {t("common.submitted_issues")}
            </Link>
          </li>
          <li>
            <Link href="/issues/submit">
              {t("common.submit_issue")}
            </Link>
          </li>

          <li>
            <Link href="/local-communities">
              {t("common.local_communities")}
            </Link>
          </li>
        </ul>

        <LanguageSwitcher />
      </nav>
    </header>
  );
}

import { useTranslation } from "$hooks/useTranslation.ts";
import { LanguageSwitcher } from "../LanugageSwitcher.tsx";
import { Link } from "../Link.tsx";
import { Container } from "./Container.tsx";

export function Header() {
  const { t, language } = useTranslation();

  return (
    <header class="sticky top-0 py-4 bg-[rgba(255,255,255,0.8)] backdrop-blur-lg backdrop-saturate-150 border-b border-base-300 z-9998">
      <Container>
        <nav class="flex items-center justify-between">
          <ul class="flex space-x-4">
            <li>
              <Link href="/issues" color="primary" lang={language.code}>
                {t("common.submitted_issues")}
              </Link>
            </li>
            <li>
              <Link href="/issues/submit" color="primary" lang={language.code}>
                {t("common.submit_issue")}
              </Link>
            </li>

            <li>
              <Link
                href="/local-communities"
                color="primary"
                lang={language.code}
              >
                {t("common.local_communities")}
              </Link>
            </li>
          </ul>

          <LanguageSwitcher />
        </nav>
      </Container>
    </header>
  );
}

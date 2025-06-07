import { useTranslation } from "../../hooks/useTranslation.ts";
import { LanguageSwitcher } from "../../islands/LanugageSwitcher.tsx";
import { Link } from "../Link.tsx";

export function SiteHeader() {
  const { t } = useTranslation();

  return (
    <header class="sticky top-0 mt-8">
      <nav class="navbar bg-base-100 shadow-sm">
        <ul class="flex space-x-4 px-8" f-client-nav>
          <li>
            <Link href="/" f-partial="/">Home</Link>
          </li>
          <li>
            <Link href="/about" f-partial="/about">About</Link>
          </li>
          <li>
            <Link href="/search">
              Contact
            </Link>
          </li>
          <li>
            <Link href="/countdown">
              Countdown
            </Link>
          </li>

          <li>
            <Link href="/submit-issue">
              Submit Issue
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

import { Partial } from "$fresh/runtime.ts";
import { useTranslation } from "../../hooks/useTranslation.ts";
import { LanguageSwitcher } from "../LanugageSwitcher.tsx";
import { Link } from "../Link.tsx";

export function SiteHeader() {
  const { t } = useTranslation();

  return (
    <header class="sticky top-4 mt-4 z-1">
      <nav class="navbar flex justify-between bg-base-200 shadow-sm">
        <ul class="flex space-x-4 px-8" f-client-nav>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/issues">
              {t("common.issues")}
            </Link>
          </li>
          <li>
            <Link href="/about">About</Link>
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

        <Partial name="language-switcher">
          <LanguageSwitcher />
        </Partial>
      </nav>
    </header>
  );
}

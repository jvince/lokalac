import { Partial } from "$fresh/runtime.ts";
import { defineLayout } from "$fresh/src/server/defines.ts";
import { AppState } from "$types/app.ts";
import { Link } from "../components/index.ts";
import { LanguageSwitcher } from "../components/LanguageSwitcher.tsx";

export default defineLayout<AppState>((_, ctx) => {
  return (
    <div class="max-w-[100rem] mx-auto">
      <header class="sticky top-0 mt-8">
        <nav class="navbar bg-base-100 shadow-sm">
          <ul class="flex space-x-4 px-8">
            <li>
              <Link href="/">Home</Link>
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
                Local Communities
              </Link>
            </li>
          </ul>

          <LanguageSwitcher />
        </nav>
      </header>

      <main>
        <Partial name="content">
          <ctx.Component />
        </Partial>
      </main>
    </div>
  );
});

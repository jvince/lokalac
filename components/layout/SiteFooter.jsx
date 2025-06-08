import { Link } from "$components/Link.tsx";

export function SiteFooter() {
  return (
    <footer className="footer footer-center p-4">
      <a href="https://fresh.deno.dev">
        <img
          width="197"
          height="37"
          src="https://fresh.deno.dev/fresh-badge.svg"
          alt="Made with Fresh"
        />
      </a>
    </footer>
  );
}

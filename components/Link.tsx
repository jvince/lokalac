import { colorsUI, variantsUI } from "@/types/daisyui.ts";
import { defineThemeProps, withTheme } from "@/utils/theme.tsx";
import { toNormalizedUrl } from "@/utils/url.ts";
import { clsx } from "clsx/lite";
import type { JSX } from "preact";

/**
 * @fileoverview
 * Tailwind class names:
 * - link
 * - link-primary
 * - link-secondary
 * - link-accent
 * - link-neutral
 * - link-info
 * - link-success
 * - link-warning
 * - link-error
 */

interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  as?: "link" | "btn";
  href?: string;
  lang?: string;
  withHover?: boolean;
}

function LinkBase(props: LinkProps) {
  const {
    as = "link",
    href = "",
    lang,
    withHover = true,
    ...rest
  } = props;

  const className = clsx(
    props.class || props.className,
    as === "link" && withHover && "link-hover",
  );

  return (
    <a
      {...rest}
      href={toNormalizedUrl(href, lang)}
      class={className}
    >
      {props.children}
    </a>
  );
}

export const Link = withTheme(
  LinkBase,
  (props) => (props.as ?? "link") === "link" ? "link" : "btn",
  defineThemeProps({
    color: colorsUI,
    variant: variantsUI,
  }),
);

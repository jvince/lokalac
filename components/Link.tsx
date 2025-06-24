import { clsx } from "clsx/lite";
import type { JSX } from "preact";
import { useURL } from "../hooks/useURL.ts";
import { defineThemeProps, withTheme } from "$utils/theme.tsx";
import { colorsUI, variantsUI } from "$types/daisyui.ts";

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
  withHover?: boolean;
}

function LinkBase(props: LinkProps) {
  const {
    as = "link",
    href = "",
    withHover = true,
    ...rest
  } = props;
  const { active, url } = useURL(href);

  const className = clsx(
    props.class || props.className,
    as === "link" && withHover && "link-hover",
    active && "underline",
  );

  return (
    <a
      {...rest}
      href={url}
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

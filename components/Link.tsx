import { colorsUI, variantsUI } from "$types/daisyui.ts";
import { defineThemeProps, withTheme } from "$utils/theme.tsx";
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
  withHover?: boolean;
}

function LinkBase(props: LinkProps) {
  const {
    as = "link",
    href = "",
    withHover = true,
    ...rest
  } = props;

  const className = clsx(
    props.class || props.className,
    as === "link" && withHover && "link-hover"
  );

  return (
    <a
      {...rest}
      href={href}
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

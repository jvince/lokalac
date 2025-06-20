import { clsx } from "clsx/lite";
import type { JSX } from "preact";
import { useURL } from "../hooks/useURL.ts";

type Color =
  | "neutral"
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "info"
  | "warning"
  | "error";

type Variant =
  | "outline"
  | "dash"
  | "soft"
  | "ghost"
  | "link";

const linkColorToClass = {
  neutral: "link-neutral",
  primary: "link-primary",
  secondary: "link-secondary",
  accent: "link-accent",
  success: "link-success",
  info: "link-info",
  warning: "link-warning",
  error: "link-error",
} as const;

const colorToClass = {
  neutral: "btn-neutral",
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  success: "btn-success",
  info: "btn-info",
  warning: "btn-warning",
  error: "btn-error",
} as const;

const variantToClass = {
  outline: "btn-outline",
  dash: "btn-dash",
  soft: "btn-soft",
  ghost: "btn-ghost",
  link: "btn-link",
} as const;

interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  as?: "link" | "btn";
  color?: Color;
  href?: string;
  variant?: Variant;
  withHover?: boolean;
}

export function Link(props: LinkProps) {
  const {
    as = "link",
    color = "primary",
    href = "",
    variant,
    withHover = true,
    ...rest
  } = props;
  const asButton = as === "btn";
  const asLink = as === "link";

  const { active, url } = useURL(href);

  const className = clsx(
    as,
    as !== "link" && variant && variantToClass[variant],
    asLink && linkColorToClass[color],
    asLink && withHover && "link-hover",
    asButton && colorToClass[color],
    active && "underline",
    props.class,
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

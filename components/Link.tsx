import type { JSX } from "preact";
import { clsx } from "clsx/lite";
import { useGlobalContext } from "../globalContext.ts";

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

interface LinkProps extends JSX.HTMLAttributes<HTMLAnchorElement> {
  as?: "link" | "btn";
  color?: Color;
  href?: string;
  lang?: string;
  variant?: Variant;
  withHover?: boolean;
}

export function Link(props: LinkProps) {
  const {
    as = "link",
    color = "primary",
    lang,
    href = "#",
    variant,
    withHover = true,
    ...rest
  } = props;

  const { lang: contextLang } = useGlobalContext();

  const className = clsx(
    as,
    as !== "link" && variant && variantToClass[variant],
    as === "btn" && colorToClass[color],
    as === "link" && linkColorToClass[color],
    as === "link" && withHover && "link-hover",
    "aria-[current=page]:underline",
    props.class,
  );

  return (
    <a
      {...rest}
      href={`${href}?lang=${lang ?? contextLang}`}
      class={className}
    >
      {props.children}
    </a>
  );
}

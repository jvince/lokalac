import { clsx } from "clsx/lite";
import type { JSX } from "preact";

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

type Size =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

const colorToClass = {
  neutral: "btn-neutral",
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  success: "btn-success",
  info: "btn-info",
  warning: "btn-warning",
  error: "btn-error",
};

const variantToClass = {
  outline: "btn-outline",
  dash: "btn-dash",
  soft: "btn-soft",
  ghost: "btn-ghost",
  link: "btn-link",
};

const sizeToClass = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: Color;
  variant?: Variant;
  size?: Size;
}

export function Button(props: ButtonProps) {
  const {
    color,
    size,
    variant,
    ...restProps
  } = props;
  const className = clsx(
    "btn",
    color && colorToClass[color],
    size && sizeToClass[size],
    variant && variantToClass[variant],
    props.class || props.className,
  );
  return (
    <button
      {...restProps}
      class={className}
    />
  );
}

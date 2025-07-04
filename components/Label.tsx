import { clsx } from "clsx/lite";
import type { JSX } from "preact";
import { createElement } from "preact";

/**
 * @fileoverview
 * Tailwind class names:
 * - label
 * - text-primary
 * - text-secondary
 * - text-accent
 * - text-info
 * - text-success
 * - text-warning
 * - text-error
 * - text-xs
 * - text-sm
 * - text-md
 * - text-lg
 * - text-xl
 */

type LabelProps =
  & JSX.LabelHTMLAttributes<HTMLLabelElement>
  & Pick<JSX.InputHTMLAttributes<HTMLInputElement>, "required">
  & {
    as?: "span" | "label";
    color?:
      | "primary"
      | "secondary"
      | "accent"
      | "info"
      | "success"
      | "warning"
      | "error";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
  };

export function Label(props: LabelProps) {
  const {
    as = "span",
    required = false,
    color = "accent",
    size,
    ...restProps
  } = props;

  const className = clsx(
    "label",
    `text-${color}`,
    size && `text-${size}`,
    props.class || props.className,
  );

  return createElement(
    as,
    {
      ...restProps,
      className,
    },
    <>
      {props.children} {required && <sup>*</sup>}
    </>,
  );
}

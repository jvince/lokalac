import clsx from "clsx/lite";
import { JSX } from "preact";
import { defineThemeProps, withTheme } from "$utils/theme.tsx";
import { colorsUI, sizesUI } from "$types/daisyui.ts";

/**
 * @fileoverview
 * Tailwind class names:
 * - select
 * - select-ghost
 * - select-neutral
 * - select-primary
 * - select-secondary
 * - select-accent
 * - select-info
 * - select-success
 * - select-warning
 * - select-error
 * - select-xs
 * - select-sm
 * - select-md
 * - select-lg
 * - select-xl
 */

interface SelectProps
  extends Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  fullWidth?: boolean;
}

export function SelectBase(props: SelectProps) {
  const {
    children,
    fullWidth = false,
    ...restProps
  } = props;

  const className = clsx(
    props.class || props.className,
    props.required && "validator",
    fullWidth && "w-full",
  );

  return (
    <select
      {...restProps}
      class={className}
    >
      {children}
    </select>
  );
}

export const Select = withTheme(
  SelectBase,
  "select",
  defineThemeProps({
    color: colorsUI,
    size: sizesUI,
    variant: ["ghost"],
  }),
);

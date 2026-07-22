import { colorsUI, sizesUI } from "@/types/daisyui.ts";
import { defineThemeProps, withTheme } from "@/utils/theme.tsx";
import clsx from "clsx/lite";
import { JSX } from "preact";
import { Label } from "./Label.tsx";

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
  label?: string;
}

export function SelectBase(props: SelectProps) {
  const {
    children,
    label,
    fullWidth = false,
    ...restProps
  } = props;

  const className = clsx(
    props.class || props.className,
    props.required && "validator",
    fullWidth && "w-full",
  );

  return (
    <label class={className}>
      {label && (
        <Label
          required={props.required}
        >
          {label}
        </Label>
      )}
      <select
        {...restProps}
      >
        {children}
      </select>
    </label>
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

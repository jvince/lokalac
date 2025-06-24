import { colorsUI, sizesUI } from "$types/daisyui.ts";
import { defineThemeProps, withTheme } from "$utils/theme.tsx";
import { clsx } from "clsx/lite";
import { type JSX } from "preact";

/**
 * @fileoverview
 * Tailwind class names:
 * - input
 * - input-ghost
 * - input-neutral
 * - input-primary
 * - input-secondary
 * - input-accent
 * - input-info
 * - input-success
 * - input-warning
 * - input-error
 * - input-xs
 * - input-sm
 * - input-md
 * - input-lg
 * - input-xl
 */

interface InputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size"> {
}

function InputBase(props: InputProps) {
  const rootClassName = clsx(
    "flex",
  );

  const inputClassName = clsx(
    "input",
    props.class || props.className,
  );

  return (
    <span class={rootClassName}>
      <input
        {...props}
        class={inputClassName}
      />
    </span>
  );
}

export const Input = withTheme(
  InputBase,
  "input",
  defineThemeProps({
    color: colorsUI,
    size: sizesUI,
    variant: ["ghost"],
  }),
);

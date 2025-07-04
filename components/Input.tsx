import { colorsUI, sizesUI } from "$types/daisyui.ts";
import { defineThemeProps, withTheme } from "$utils/theme.tsx";
import { clsx } from "clsx/lite";
import type { JSX, VNode } from "preact";
import { cloneElement } from "preact";
import { Label } from "./Label.tsx";

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
  contentAfter?: VNode;
  contentBefore?: VNode;
  fullWidth?: boolean;
  label?: string;
}

function InputBase(props: InputProps) {
  const {
    class: klassName,
    className,
    contentAfter,
    contentBefore,
    fullWidth = false,
    label,
    ...restProps
  } = props;

  const hasAddons = !!(contentAfter || contentBefore);

  const rootClassName = clsx(
    hasAddons && "join",
  );

  const inputClassName = clsx(
    klassName || className,
    hasAddons && "join-item",
    fullWidth && "w-full",
  );

  return (
    <span class={rootClassName}>
      {contentBefore && cloneElement(contentBefore, { class: "join-item" })}
      <label class={inputClassName}>
        {label && (
          <Label
            required={props.required}
          >
            {label}
          </Label>
        )}
        <input
          {...restProps}
        />
      </label>
      {contentAfter && cloneElement(contentAfter, { class: "join-item" })}
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

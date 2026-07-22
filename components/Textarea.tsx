import { colorsUI, sizesUI } from "@/types/daisyui.ts";
import { defineThemeProps, withTheme } from "@/utils/theme.tsx";
import type { JSX } from "preact";

/**
 * @fileoverview
 * Tailwind class names:
 * - textarea
 * - textarea-ghost
 * - textarea-neutral
 * - textarea-primary
 * - textarea-secondary
 * - textarea-accent
 * - textarea-info
 * - textarea-success
 * - textarea-warning
 * - textarea-error
 * - textarea-xs
 * - textarea-sm
 * - textarea-md
 * - textarea-lg
 * - textarea-xl
 */

interface TextareaProps
  extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {}

function TextareaBase(props: TextareaProps) {
  return <textarea {...props} />;
}

export const Textarea = withTheme(
  TextareaBase,
  "textarea",
  defineThemeProps({
    color: colorsUI,
    size: sizesUI,
    variant: ["ghost"],
  }),
);

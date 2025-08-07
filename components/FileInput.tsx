import type { JSX } from "preact";
import { defineThemeProps, withTheme } from "$utils/theme.tsx";
import { colorsUI, sizesUI } from "$types/daisyui.ts";

/**
 * @fileoverview
 * Tailwind class names:
 * - file-input
 * - file-input-primary
 * - file-input-secondary
 * - file-input-accent
 * - file-input-neutral
 * - file-input-info
 * - file-input-success
 * - file-input-warning
 * - file-input-error
 * - file-input-ghost
 * - file-input-xs
 * - file-input-sm
 * - file-input-md
 * - file-input-lg
 * - file-input-xl
 */

export interface FileInputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {}

function FileInputBase(props: FileInputProps) {
  return (
    <input
      type="file"
      {...props}
    />
  );
}

export const FileInput = withTheme(
  FileInputBase,
  "file-input",
  defineThemeProps({
    color: colorsUI,
    size: sizesUI,
    variant: ["ghost"],
  }),
);

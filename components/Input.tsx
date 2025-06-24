import { type JSX } from "preact";
import { clsx } from "clsx/lite";
import { ColorUI, VariantUI } from "$types/daisyui.ts";

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  color?: ColorUI;
  variant?: Extract<VariantUI, "ghost">;
}

export function Input(props: InputProps) {
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

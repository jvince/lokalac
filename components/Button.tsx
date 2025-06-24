import {
  colorsUI,
  sizesUI,
  variantsUI
} from "$types/daisyui.ts";
import { defineThemeProps, withDaisyUIMappedClass } from "$utils/theme.tsx";
import { clsx } from "clsx/lite";
import type { JSX } from "preact";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

function ButtonBase(props: ButtonProps) {
  const {
    children,
    fullWidth = false,
    type = "button",
    ...restProps
  } = props;

  const className = clsx(
    props.class || props.className,
    "inline-flex",
    "w-fit",
    fullWidth && "w-full",
  );

  return (
    <button
      {...restProps}
      class={className}
      type={type}
    >
      {children}
    </button>
  );
}

export const Button = withDaisyUIMappedClass(
  ButtonBase,
  "btn",
  defineThemeProps({
    color: colorsUI,
    size: sizesUI,
    variant: variantsUI,
  }),
)

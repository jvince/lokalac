import { colorsUI, sizesUI, variantsUI } from "$types/daisyui.ts";
import { defineThemeProps, withTheme } from "$utils/theme.tsx";
import { clsx } from "clsx/lite";
import type { JSX } from "preact";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  iconOnly?: boolean;
  shape?: "circle" | "square";
}

function ButtonBase(props: ButtonProps) {
  const {
    children,
    fullWidth = false,
    iconOnly = false,
    shape,
    type = "button",
    ...restProps
  } = props;

  const className = clsx(
    props.class || props.className,
    "inline-flex",
    "w-fit",
    shape === "circle" && "btn-circle",
    shape === "square" && "btn-square",
    fullWidth && "w-full",
    iconOnly && "aspect-square",
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

export const Button = withTheme(
  ButtonBase,
  "btn",
  defineThemeProps({
    color: colorsUI,
    size: sizesUI,
    variant: variantsUI,
  }),
);

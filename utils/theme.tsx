import type { ColorUI, SizeUI, VariantUI } from "$types/daisyui.ts";
import { clsx } from "clsx/lite";
import type { ComponentProps, JSX } from "preact";

type ThemePropMap = {
  color?: readonly ColorUI[];
  variant?: readonly VariantUI[];
  size?: readonly SizeUI[];
};

type InferThemeProps<T extends ThemePropMap> = {
  [K in keyof T]?: T[K] extends readonly (infer U)[] ? U
    : never;
};

export function withDaisyUIMappedClass<
  ThemeProps extends InferThemeProps<ThemePropMap>,
  T extends JSX.ElementType<
    ThemePropMap & { class?: string; className?: string }
  > = JSX.ElementType<ThemePropMap & { class?: string; className?: string }>,
  P extends ComponentProps<T> = ComponentProps<T>,
>(
  Component: T,
  elClass: string | ((props: P) => string),
  classMap: ThemeProps,
) {
  return (props: P & ThemeProps) => {
    const {
      color,
      variant,
      size,
      ...restProps
    } = props;

    const rootClass = typeof elClass === "function" ? elClass(props) : elClass;
    const classList = Object.entries(classMap).reduce<
      Record<string, Record<string, string>>
    >((acc, [prop, values]) => {
      return {
        ...acc,
        [prop]: (values as readonly string[]).reduce<Record<string, string>>(
          (acc, value) => {
            return {
              ...acc,
              [value]: `${rootClass}-${value}`,
            };
          },
          {},
        ),
      };
    }, {});

    const className = clsx(
      rootClass,
      typeof color === "string" && color in classList.color &&
        classList.color[color],
      typeof size === "string" && size in classList.size &&
        classList.size[size],
      typeof variant === "string" && variant in classList.variant &&
        classList.variant[variant],
      props.class || props.className,
    );

    return (
      <Component
        {...restProps as any}
        class={className}
      />
    );
  };
}

export function defineThemeProps<T extends ThemePropMap>(props: T) {
  return props as InferThemeProps<T>;
}
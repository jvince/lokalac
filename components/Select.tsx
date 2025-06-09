import clsx from "clsx/lite";
import { ComponentChildren, JSX } from "preact";

interface SelectProps extends JSX.HTMLAttributes<HTMLSelectElement> {
  children?: ComponentChildren;
}

export function Select(props: SelectProps) {
  const { children, ...restProps } = props;

  const className = clsx(
    "select",
    props.required && "validator",
    props.class || props.className,
  );

  return (
    <select
      {...restProps}
      class={className}
      placeholder="Kesa"
    >
      {children}
    </select>
  );
}

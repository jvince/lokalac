import clsx from "clsx/lite";
import { JSX } from "preact";

interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {}

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
    >
      {children}
    </select>
  );
}

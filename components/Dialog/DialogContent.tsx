import type { JSX } from "preact";
import { clsx } from "clsx/lite";

interface DialogContentProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function DialogContent(props: DialogContentProps) {
  const { children, ...restProps } = props;

  const className = clsx(
    "dialog-content",
    "flex-grow",
    props.class || props.className,
  );

  return (
    <div
      {...restProps}
      class={className}
    >
      {children}
    </div>
  );
}

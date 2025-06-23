import type { JSX } from "preact";
import { clsx } from "clsx/lite";

interface DialogBodyProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function DialogBody(props: DialogBodyProps) {
  const { children, ...restProps } = props;

  const className = clsx(
    "dialog-body",
    "modal-box",
    "flex",
    "flex-col",
    "size-[90%]",
    "max-w-[none]",
    "m-6",
    "transition-none",
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

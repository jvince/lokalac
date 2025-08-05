import { clsx } from "clsx/lite";
import type { JSX } from "preact";
import { useDialogContext } from "./dialogContext.ts";

interface DialogBodyProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function DialogBody(props: DialogBodyProps) {
  const { children, ...restProps } = props;
  const { size } = useDialogContext();

  const className = clsx(
    "dialog-body",
    "modal-box",
    "flex",
    "flex-col",
    "m-6",
    "transition-none",
    size === "lg" && "size-[90%]",
    size && "max-w-[none]",
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

import { clsx } from "clsx/lite";
import { type JSX } from "preact";

export interface DialogActionsProps extends JSX.HTMLAttributes<HTMLDivElement> {
  position?: "start" | "end" | "center";
}

export function DialogActions(props: DialogActionsProps) {
  const {
    children,
    position = "end",
    ...restProps
  } = props;

  const className = clsx(
    "modal-action",
    position === "start" && "justify-start",
    position === "center" && "justify-center",
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

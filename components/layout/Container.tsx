import type { ComponentChildren, JSX } from "preact";
import { clsx } from "clsx/lite";

interface ContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children?: ComponentChildren;
}

export function Container(props: ContainerProps) {
  const className = clsx(
    "max-w-[80rem]",
    "h-full",
    "mx-auto",
    "px-6",
    props.class || props.className,
  );

  return (
    <div class={className}>
      {props.children}
    </div>
  );
}

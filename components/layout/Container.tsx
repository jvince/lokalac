import type { ComponentChildren, JSX } from "preact";

interface ContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children?: ComponentChildren;
}

export function Container(props: ContainerProps) {
  return (
    <div class="max-w-[80rem] mx-auto px-6">
      {props.children}
    </div>
  );
}

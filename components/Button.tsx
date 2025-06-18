import { JSX } from "preact";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      class="btn btn-primary btn-lg"
    />
  );
}

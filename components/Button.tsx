import { JSX } from "preact";

export function Button(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      class="btn btn-primary btn-lg"
    />
  );
}

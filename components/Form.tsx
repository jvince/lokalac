import type { JSX } from "preact";
import { useGlobalContext } from "../globalContext.ts";

interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {}

export function Form(props: FormProps) {
  const { language } = useGlobalContext();

  return (
    <form
      {...props}
    >
      {props.children}
      <input type="hidden" name="lang" value={language.code} />
    </form>
  );
}

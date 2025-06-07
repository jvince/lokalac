import type { JSX } from "preact";
import { useGlobalContext } from "../globalContext.ts";

interface FormProps extends JSX.HTMLAttributes<HTMLFormElement> {}

export function Form(props: FormProps) {
  const { language: lang } = useGlobalContext();

  return (
    <form
      {...props}
    >
      {props.children}
      <input type="hidden" name="lang" value={lang} />
    </form>
  );
}
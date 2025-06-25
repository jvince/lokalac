import type { JSX } from "preact";

interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {}

export function Form(props: FormProps) {
  const { lang, ...restProps } = props;

  return (
    <form
      {...restProps}
    >
      {props.children}
      {lang && <input type="hidden" name="lang" value={lang} />}
    </form>
  );
}

import {
  createInternalUrl,
  createLanguageUrl,
  toRelativeUrl,
} from "$utils/url.ts";
import type { JSX } from "preact";
interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {}

export function Form(props: FormProps) {
  const {
    action,
    lang,
    ...restProps
  } = props;

  return (
    <form
      {...restProps}
      action={toRelativeUrl(
        createLanguageUrl(
          createInternalUrl(action?.toString()),
          lang?.toString(),
        ),
      )}
    >
      {props.children}
      {lang && <input type="hidden" name="lang" value={lang} />}
    </form>
  );
}

import { toNormalizedUrl } from "$utils/url.ts";
import type { JSX } from "preact";
import { forwardRef } from "react-dom";
import { defaultLanguage } from "../languages.ts";

interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {}

export const Form = forwardRef<HTMLFormElement, FormProps>((props, ref) => {
  const {
    action,
    lang,
    ...restProps
  } = props;

  const shouldIncludeLang = typeof lang === "string" &&
    lang !== defaultLanguage.code;

  return (
    <form
      {...restProps}
      ref={ref}
      action={toNormalizedUrl(action?.toString(), lang?.toString())}
    >
      {props.children}
      {shouldIncludeLang && <input type="hidden" name="lang" value={lang} />}
    </form>
  );
});

Form.displayName = "Form";

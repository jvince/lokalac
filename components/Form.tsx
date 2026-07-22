import { defaultLanguage } from "@/languages.ts";
import { toNormalizedUrl } from "@/utils/url.ts";
import type { FormHTMLAttributes } from "preact";
import { forwardRef } from "preact/compat";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  method?: "GET" | "POST";
}

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

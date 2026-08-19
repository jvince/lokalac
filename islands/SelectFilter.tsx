import { Form } from "@/components/Form.tsx";
import { Select } from "@/components/Select.tsx";
import type { FormHTMLAttributes } from "preact";
import { useCallback, useRef } from "preact/hooks";

interface OptionData {
  value: string;
  label: string;
}

interface SelectFilterProps extends FormHTMLAttributes<HTMLElement> {
  defaultValue?: string;
  method?: "GET" | "POST";
  options?: OptionData[];
}

export function SelectFilter(props: SelectFilterProps) {
  const { action, method, name, defaultValue, options, lang } = props;
  const formRef = useRef<HTMLFormElement>(null);

  const onChangeHandler = useCallback(() => {
    if (formRef.current) {
      formRef.current.submit();
    }
  }, []);

  return (
    <Form ref={formRef} action={action} method={method} lang={lang}>
      <Select
        defaultValue={defaultValue}
        name={name}
        variant="ghost"
        onChange={onChangeHandler}
      >
        {options?.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Form>
  );
}

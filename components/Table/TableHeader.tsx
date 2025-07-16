import type { JSX } from "preact";
import { useTableContext } from "./tableContext.ts";
import { TableRowContextProvider } from "./tableRowContext.ts";
import { useMemo } from "preact/hooks";

interface TableHeaderProps
  extends JSX.HTMLAttributes<HTMLTableSectionElement> {}

export function TableHeader(props: TableHeaderProps) {
  const { children, ...restProps } = props;
  const className = props.class || props.className;
  const { columns } = useTableContext();

  return (
    <thead {...restProps} class={className}>
      <TableRowContextProvider
        value={useMemo(() => ({
          kind: "header",
          item: null,
          columns,
        }), [columns])}
      >
        {children}
      </TableRowContextProvider>
    </thead>
  );
}

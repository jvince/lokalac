import type { ComponentChild, JSX } from "preact";
import { useTableContext } from "./tableContext.ts";
import { TableRowContextProvider } from "./tableRowContext.ts";
import type { TableData } from "./types.ts";

interface Children<T> {
  (props: { item: T; rowId: string }): ComponentChild;
}

interface TableBodyProps<T extends TableData = TableData>
  extends JSX.HTMLAttributes<HTMLTableSectionElement> {
  children: Children<T>;
}

export function TableBody<T extends TableData = TableData>(
  props: TableBodyProps<T>,
) {
  const { children, ...restProps } = props;
  const className = props.class || props.className;
  const { items, columns } = useTableContext<T>();

  return (
    <tbody {...restProps} class={className}>
      {items.map((item) => (
        <TableRowContextProvider
          value={{
            kind: "body",
            item,
            // deno-lint-ignore no-explicit-any
            columns: columns as any,
          }}
        >
          {children({ item, rowId: item.id })}
        </TableRowContextProvider>
      ))}
    </tbody>
  );
}

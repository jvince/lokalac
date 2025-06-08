import type { ComponentChild, JSX } from "preact";
import { useTableRowContext } from "./tableRowContext.ts";
import { TableData } from "./types.ts";

interface TableRowProps extends JSX.HTMLAttributes<HTMLTableRowElement> {
  children: (
    arg: { render: (item: TableData) => ComponentChild, item: any },
  ) => ComponentChild;
}

export function TableRow(props: TableRowProps) {
  const { children, ...restProps } = props;

  const className = props.class || props.className;
  const { item, columns } = useTableRowContext();

  return (
    <tr {...restProps} class={className}>
      {columns.map((column, index) => (
        children({ render: columns[index].cell, item })
      ))}
    </tr>
  );
}

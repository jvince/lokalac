import type { ComponentChild, JSX } from "preact";
import { useTableRowContext } from "./tableRowContext.ts";
import type { TableColumn, TableData, TableRowKind } from "./types.ts";

interface Children<T> {
  (props: { cell: ComponentChild; item: T | null }): ComponentChild;
}

interface TableRowProps<T extends TableData = TableData>
  extends JSX.HTMLAttributes<HTMLTableRowElement> {
  children: Children<T>;
}

function renderCell<T extends TableData>(
  column: TableColumn<T>,
  item: TableData | null,
  kind: TableRowKind,
) {
  if (kind === "body") {
    return item ? column.cell(item as T) : null;
  }

  return "Kesa";
}

export function TableRow<T extends TableData = TableData>(
  props: TableRowProps<T>,
) {
  const { children, ...restProps } = props;

  const className = props.class || props.className;
  const { item, columns, kind } = useTableRowContext<T>();

  return (
    <tr {...restProps} class={className}>
      {columns.map((column) => (
        children({ cell: renderCell(column, item, kind), item })
      ))}
    </tr>
  );
}

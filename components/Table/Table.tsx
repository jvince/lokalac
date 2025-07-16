import { clsx } from "clsx/lite";
import type { ComponentChildren, JSX } from "preact";
import { TableContextProvider } from "./tableContext.ts";
import type { TableColumn, TableData } from "./types.ts";

interface TableProps<T extends TableData>
  extends JSX.HTMLAttributes<HTMLTableElement> {
  children?: ComponentChildren;
  columns?: TableColumn<T>[];
  items?: T[];
}

const defaultColumns: TableColumn<TableData>[] = [];
const defaultItems: TableData[] = [];

export function Table<T extends TableData>(props: TableProps<T>) {
  const {
    children,
    columns = defaultColumns,
    items = defaultItems,
    ...restProps
  } = props;

  const className = clsx(
    "table",
    props.class || props.className,
  );

  return (
    // deno-lint-ignore no-explicit-any
    <TableContextProvider value={{ columns: columns as any, items }}>
      <table {...restProps} class={className}>
        {children}
      </table>
    </TableContextProvider>
  );
}

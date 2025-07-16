import { clsx } from "clsx/lite";
import type { ComponentChildren, JSX } from "preact";
import { TableContextProvider } from "./tableContext.tsx";
import type { TableColumn, TableData } from "./types.ts";
import { useMemo } from "preact/hooks";

interface TableProps<T extends TableData = TableData>
  extends JSX.HTMLAttributes<HTMLTableElement> {
  children?: ComponentChildren;
  columns?: TableColumn<T>[];
  items?: T[];
}

const defaultColumns: TableColumn<TableData>[] = [];
const defaultItems: TableData[] = [];

export function Table<T extends TableData = TableData>(props: TableProps<T>) {
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

  const contextValue = useMemo(() => ({
    columns: columns as TableColumn<T>[],
    items: items as T[],
  }), [columns, items]);

  return (
    <TableContextProvider<T> value={contextValue}>
      <table {...restProps} class={className}>
        {children}
      </table>
    </TableContextProvider>
  );
}

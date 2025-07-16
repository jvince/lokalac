import { type ComponentChildren, createContext } from "preact";
import { useContext } from "preact/hooks";
import { TableColumn, TableData } from "./types.ts";

export interface TableContextValue<T extends TableData = TableData> {
  columns: TableColumn<T>[];
  items: T[];
}

const defaultTableContextValue: TableContextValue = {
  columns: [],
  items: [],
};

// deno-lint-ignore no-explicit-any
const TableContext = createContext<TableContextValue<any>>(null!);

interface TableContextProviderProps<T extends TableData> {
  value: TableContextValue<T>;
  children: ComponentChildren;
}

export function TableContextProvider<T extends TableData>(
  props: TableContextProviderProps<T>,
) {
  return (
    <TableContext.Provider value={props.value}>
      {props.children}
    </TableContext.Provider>
  );
}

export function useTableContext<T extends TableData = TableData>() {
  const value = useContext(TableContext);
  return (value ?? defaultTableContextValue) as unknown as TableContextValue<T>;
}

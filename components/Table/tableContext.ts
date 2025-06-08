import { createContext } from "preact";
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

const TableContext = createContext<TableContextValue>(null!);

export const TableContextProvider = TableContext.Provider;

export function useTableContext<T extends TableData = TableData>() {
  const value = useContext(TableContext);
  return (value ?? defaultTableContextValue) as unknown as TableContextValue<T>;
}

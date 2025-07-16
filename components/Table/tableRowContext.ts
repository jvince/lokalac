import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { TableContextValue } from "./tableContext.ts";
import type { TableData, TableRowKind } from "./types.ts";

interface TableRowContextValue<T extends TableData = TableData>
  extends Omit<TableContextValue<T>, "items"> {
  kind: TableRowKind;
  item: T | null;
}

const defaultRowContextValue: TableRowContextValue = {
  kind: "body",
  item: null,
  columns: [],
};

const TableRowContext = createContext<TableRowContextValue>(null!);

export const { Provider: TableRowContextProvider } = TableRowContext;

export function useTableRowContext<T extends TableData = TableData>() {
  const value = useContext(TableRowContext);
  return (value ?? defaultRowContextValue) as unknown as TableRowContextValue<
    T
  >;
}

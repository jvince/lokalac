import { ComponentChild } from "preact";

export interface TableData {
  id: string;
}

export interface TableColumn<T extends TableData = TableData> {
  id: string;
  header?: string | ComponentChild;
  cell: (item: T) => ComponentChild;
}

export type TableRowKind = "body" | "header" | "footer";

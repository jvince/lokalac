import { createElement, JSX } from "preact";

interface TableCellProps extends JSX.HTMLAttributes<HTMLTableCellElement> {
  as?: "td" | "th";
  scope?: "row" | "col" | "rowgroup" | "colgroup";
}

export function TableCell(props: TableCellProps) {
  const {
    as = "td",
    children,
    ...restProps
  } = props;

  return createElement(as, restProps, children);
}

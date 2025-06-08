import { JSX } from "preact";
import { useTableContext } from "./tableContext.ts";
import { TableRowContextProvider } from "./tableRowContext.ts";

interface TableBodyProps extends JSX.HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody(props: TableBodyProps) {
  const { children, ...restProps } = props;
  const className = props.class || props.className;
  const { items, columns } = useTableContext();

  return (
    <tbody {...restProps} class={className}>
      {items.map((item) => (
        <TableRowContextProvider value={{ kind: "body", item, columns }}>
          {children}
        </TableRowContextProvider>
      ))}
    </tbody>
  );
}

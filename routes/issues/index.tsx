import { Link } from "$components/Link.tsx";
import { Table } from "$components/Table/Table.tsx";
import { TableBody } from "$components/Table/TableBody.tsx";
import { TableCell } from "$components/Table/TableCell.tsx";
import { TableRow } from "$components/Table/TableRow.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import { getIssues, IssueDTO } from "$models/issue.ts";
import { AppState } from "$types/app.ts";

interface Data {
  issues: IssueDTO[];
}

export const handler: Handlers<Data, AppState> = {
  async GET(_, ctx) {
    return await ctx.render({ issues: await Array.fromAsync(getIssues()) });
  },
};

export default function Page(props: PageProps<Data>) {
  const { data } = props;
  const { fromObject } = useTranslation();

  return (
    <>
      <Table
        items={data.issues}
        columns={[
          {
            id: "id",
            cell: (item) => item.id,
          },
          {
            id: "community",
            cell: (item) => fromObject(item.community, "name"),
          },
          {
            id: "category",
            cell: (item) => fromObject(item.category, "name"),
          },
          {
            id: "type",
            cell: (item) => fromObject(item.type, "name"),
          },
          {
            id: "status",
            cell: (item) => item.status,
          },
          {
            id: "edit",
            cell: (item) => (
              <Link
                as="btn"
                color="secondary"
                href={`/issues/${item.id}/edit`}
                variant="soft"
              >
                Edit
              </Link>
            ),
          },
        ]}
      >
        <TableBody>
          <TableRow>
            {({ render, item }) => <TableCell>{render(item)}</TableCell>}
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}

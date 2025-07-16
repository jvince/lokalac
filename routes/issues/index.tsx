import { Link } from "$components/Link.tsx";
import { Table } from "$components/Table/Table.tsx";
import { TableBody } from "$components/Table/TableBody.tsx";
import { TableCell } from "$components/Table/TableCell.tsx";
import { TableHeader } from "$components/Table/TableHeader.tsx";
import { TableRow } from "$components/Table/TableRow.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import { LocationDialog } from "$islands/LocationDialog.tsx";
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

export default function Page(props: PageProps<Data, AppState>) {
  const { data, state } = props;
  const { fromObject } = useTranslation();

  return (
    <>
      <Table
        items={data.issues}
        columns={[
          {
            id: "id",
            header: "ID",
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
            id: "location",
            cell: (item) =>
              item.location && (
                  <LocationDialog
                    location={item.location}
                    i18nState={{
                      language: state.language,
                      translation: state.translation,
                    }}
                  />
                ) ||
              "N/A",
          },
          {
            id: "submittedAt",
            cell: (item) =>
              Temporal.ZonedDateTime.from(item.submittedAt)
                .toPlainDateTime()
                .toLocaleString(state.language.code, { dateStyle: "medium" }),
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
        <TableHeader>
          <TableRow key="header">
            {({ cell }) => <TableCell as="th" scope="col">{cell}</TableCell>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {({ rowId }) => (
            <TableRow id={rowId}>
              {({ cell }) => <TableCell>{cell}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

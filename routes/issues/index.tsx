import { Link } from "$components/Link.tsx";
import { Table } from "$components/Table/Table.tsx";
import { TableBody } from "$components/Table/TableBody.tsx";
import { TableCell } from "$components/Table/TableCell.tsx";
import { TableHeader } from "$components/Table/TableHeader.tsx";
import { TableRow } from "$components/Table/TableRow.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import { LocationDialog } from "$islands/LocationDialog.tsx";
import { SelectFilter } from "$islands/SelectFilter.tsx";
import { getIssues, getIssuesByCommunity, IssueDTO } from "$models/issue.ts";
import {
  getLocalCommunities,
  LocalCommunity,
} from "$models/local-community.ts";
import { AppState } from "$types/app.ts";

interface Data {
  issues: IssueDTO[];
  communities: LocalCommunity[];
  communityFilter?: string;
}

export const handler: Handlers<Data, AppState> = {
  async GET(_, ctx) {
    const c = ctx.url.searchParams.get("c") ||
      "all";

    return await ctx.render({
      communityFilter: c,
      issues: await Array.fromAsync(
        c === "all"
          ? getIssues({ reverse: true })
          : getIssuesByCommunity(c, { reverse: true }),
      ),
      communities: await Array.fromAsync(getLocalCommunities()),
    });
  },
};

export default function Page(props: PageProps<Data, AppState>) {
  const { data, state } = props;
  const { fromObject, t } = useTranslation(state);

  const communityOptions = data.communities.map((community) => ({
    value: community.id,
    label: fromObject(community, "name"),
  }));

  return (
    <Table
      items={data.issues}
      columns={[
        {
          id: "community",
          header: (
            <SelectFilter
              action="/issues"
              defaultValue={data.communityFilter}
              method="GET"
              lang={state.language.code}
              name="c"
              options={[
                { value: "all", label: t("common.all") },
                ...communityOptions,
              ]}
            />
          ),
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
                  i18nState={state}
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
          <TableRow key={rowId}>
            {({ cell }) => <TableCell>{cell}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

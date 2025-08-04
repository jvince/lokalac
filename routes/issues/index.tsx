import { Button } from "$components/Button.tsx";
import { Form } from "$components/Form.tsx";
import { Link } from "$components/Link.tsx";
import { Select } from "$components/Select.tsx";
import { Table } from "$components/Table/Table.tsx";
import { TableBody } from "$components/Table/TableBody.tsx";
import { TableCell } from "$components/Table/TableCell.tsx";
import { TableHeader } from "$components/Table/TableHeader.tsx";
import { TableRow } from "$components/Table/TableRow.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import { LocationDialog } from "$islands/LocationDialog.tsx";
import { getIssuesByCommunityAndStatus, IssueDTO } from "$models/issue.ts";
import {
  getLocalCommunities,
  LocalCommunity,
} from "$models/local-community.ts";
import { AppState } from "$types/app.ts";
import IconFilterCancel from "https://deno.land/x/tabler_icons_tsx@0.0.7/tsx/filter-cancel.tsx";
import IconFilter from "https://deno.land/x/tabler_icons_tsx@0.0.7/tsx/filter.tsx";

interface FilterSort {
  community?: string;
  status?: string;
  updatedAt?: "asc" | "desc";
}

interface Data {
  issues: IssueDTO[];
  communities: LocalCommunity[];
  filter: FilterSort;
}

export const handler: Handlers<Data, AppState> = {
  async GET(_, ctx) {
    const community = ctx.url.searchParams.get("community") ?? "all";
    const status = ctx.url.searchParams.get("status") ?? "all";

    let updatedAt = ctx.url.searchParams.get("updatedAt") ?? "desc";
    if (updatedAt !== "asc" && updatedAt !== "desc") {
      updatedAt = "desc";
    }

    const options = { reverse: updatedAt === "desc" };

    return await ctx.render({
      filter: {
        community,
        status,
        updatedAt: updatedAt as "asc" | "desc",
      },
      issues: await Array.fromAsync(
        getIssuesByCommunityAndStatus(community, status, options),
      ),
      communities: await Array.fromAsync(getLocalCommunities()),
    });
  },
};

export default function Page(props: PageProps<Data, AppState>) {
  const { data, state } = props;
  const { fromObject, t } = useTranslation(state);
  return (
    <>
      <Form id="filter" lang={state.language.code} />

      <Table
        items={data.issues}
        columns={[
          {
            id: "community",
            header: (
              <Select
                form="filter"
                name="community"
                defaultValue={data.filter.community}
              >
                <option value="all">{t("common.all")}</option>
                {data.communities.map((community) => (
                  <option
                    key={community.id}
                    value={community.id}
                  >
                    {fromObject(community, "name")}
                  </option>
                ))}
              </Select>
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
            id: "createdAt",
            cell: (item) =>
              Temporal.ZonedDateTime.from(item.createdAt)
                .toPlainDateTime()
                .toLocaleString(state.language.code, { dateStyle: "medium" }),
          },
          {
            id: "updatedAt",
            header: (
              <>
                <input
                  type="radio"
                  name="updatedAt"
                  value="asc"
                  form="filter"
                  checked={data.filter.updatedAt === "asc" ? true : undefined}
                />
                <input
                  type="radio"
                  name="updatedAt"
                  value="desc"
                  form="filter"
                  checked={data.filter.updatedAt === "desc" ? true : undefined}
                />
              </>
            ),
            cell: (item) =>
              Temporal.ZonedDateTime.from(item.updatedAt)
                .toPlainDateTime()
                .toLocaleString(state.language.code, { dateStyle: "medium" }),
          },
          {
            id: "status",
            header: (
              <Select
                defaultValue={data.filter.status}
                form="filter"
                name="status"
                onChange={() => {
                  console.log("Status filter changed");
                }}
              >
                <option value="all">{t("common.all")}</option>
                <option value="open">{t("issue.status.open")}</option>
                <option value="closed">{t("issue.status.closed")}</option>
                <option value="in-progress">
                  {t("issue.status.in-progress")}
                </option>
              </Select>
            ),
            cell: (item) => item.status,
          },
          {
            id: "edit",
            header: (
              <div class="flex items-center gap-2">
                <Button
                  form="filter"
                  shape="circle"
                  type="submit"
                  title={t("common.filter")}
                >
                  <IconFilter size={22} />
                </Button>
                <Link
                  href="/issues"
                  lang={state.language.code}
                  title={t("common.clear-filters")}
                >
                  <IconFilterCancel size={18} />
                </Link>
              </div>
            ),
            cell: (item) => (
              <Link
                as="btn"
                color="secondary"
                href={`/issues/${item.id}/edit`}
                lang={state.language.code}
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
    </>
  );
}

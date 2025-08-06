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
import { DialogLocationView } from "$islands/DialogLocationView.tsx";
import { DialogNoteView } from "$islands/DialogNotesView.tsx";
import { getIssuesByCommunityAndStatus, IssueDTO } from "$models/issue.ts";
import {
  getLocalCommunities,
  LocalCommunity,
} from "$models/local-community.ts";
import { AppState } from "$types/app.ts";
import {
  IconFilter,
  IconFilterCancel,
  IconSortAscending2,
  IconSortDescending2,
} from "../../icons.ts";

const ITEMS_PER_PAGE = 50;

interface FilterSort {
  community?: string;
  status?: string;
  updatedAt?: "asc" | "desc";
}

interface Data {
  cursor: string;
  issues: IssueDTO[];
  communities: LocalCommunity[];
  filter: FilterSort;
}

export const handler: Handlers<Data, AppState> = {
  async GET(_, ctx) {
    const community = ctx.url.searchParams.get("community") ?? "all";
    const status = ctx.url.searchParams.get("status") ?? "all";
    const cursor = ctx.url.searchParams.get("cursor") ?? "";

    let updatedAt = ctx.url.searchParams.get("updatedAt") ?? "desc";
    if (updatedAt !== "asc" && updatedAt !== "desc") {
      updatedAt = "desc";
    }

    const options = { reverse: updatedAt === "desc", cursor, limit: ITEMS_PER_PAGE + 1 };
    const { cursor: newCursor, items: issues } =
      await getIssuesByCommunityAndStatus(
        community,
        status,
        options,
      );

    return await ctx.render({
      cursor: newCursor,
      filter: {
        community,
        status,
        updatedAt: updatedAt as "asc" | "desc",
      },
      issues,
      communities: await Array.fromAsync(getLocalCommunities()),
    });
  },
};

export default function Page(props: PageProps<Data, AppState>) {
  const { data, state } = props;
  const { fromObject, t } = useTranslation();

  const searchParams = new URLSearchParams(
    data.filter as Record<string, string>,
  );
  return (
    <>
      <Form id="filter" lang={state.language.code} />
      <Table
        items={data.issues}
        columns={[
          {
            id: "community",
            header: (
              <div class="flex flex-col gap-2">
                <Select
                  aria-labelledby="filter-community-label"
                  id="filter-community"
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
                <span id="filter-community-label">
                  {t("common.local_community")}
                </span>
              </div>
            ),
            cell: (item) => fromObject(item.community, "name"),
          },
          {
            id: "category",
            header: t("common.issue_category"),
            cell: (item) => fromObject(item.category, "name"),
          },
          {
            id: "type",
            header: t("common.issue_type"),
            cell: (item) => fromObject(item.type, "name"),
          },
          {
            id: "location",
            header: t("common.location"),
            cell: (item) =>
              item.location && (
                  <DialogLocationView
                    location={item.location}
                    i18nState={state}
                  />
                ) || "N/A",
          },
          {
            id: "note",
            header: t("common.note"),
            cell: (item) =>
              item.note && (
                  <DialogNoteView
                    i18nState={state}
                    note={item.note}
                  />
                ) || "N/A",
          },
          {
            id: "createdAt",
            header: t("common.created_at"),
            cell: (item) =>
              Temporal.ZonedDateTime.from(item.createdAt)
                .toPlainDateTime()
                .toLocaleString(state.language.code, { dateStyle: "medium" }),
          },
          {
            id: "updatedAt",
            header: (
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <label
                    class="flex items-center gap-1"
                    title={t("common.sort_asc")}
                  >
                    <input
                      type="radio"
                      name="updatedAt"
                      value="asc"
                      form="filter"
                      checked={data.filter.updatedAt === "asc"}
                    />
                    <IconSortAscending2 />
                  </label>
                  <label
                    class="flex items-center gap-1"
                    title={t("common.sort_desc")}
                  >
                    <input
                      type="radio"
                      name="updatedAt"
                      value="desc"
                      form="filter"
                      checked={data.filter.updatedAt === "desc"}
                    />
                    <IconSortDescending2 />
                  </label>
                </div>
                <span>{t("common.updated_at")}</span>
              </div>
            ),
            cell: (item) =>
              Temporal.ZonedDateTime.from(item.updatedAt)
                .toPlainDateTime()
                .toLocaleString(state.language.code, { dateStyle: "medium" }),
          },
          {
            id: "status",
            header: (
              <div class="flex flex-col gap-2">
                <Select
                  aria-labelledby="filter-status-label"
                  defaultValue={data.filter.status}
                  form="filter"
                  name="status"
                >
                  <option value="all">{t("common.all")}</option>
                  <option value="open">{t("common.status_open")}</option>
                  <option value="reported">
                    {t("common.status_reported")}
                  </option>
                  <option value="resolved">
                    {t("common.status_resolved")}
                  </option>
                  <option value="rejected">
                    {t("common.status_rejected")}
                  </option>
                </Select>
                <span id="filter-status-label">{t("common.status")}</span>
              </div>
            ),
            cell: (item) => t(`common.status_${item.status}`),
          },
          {
            id: "edit",
            header: (
              <div class="flex items-center gap-2">
                <Button
                  form="filter"
                  shape="circle"
                  type="submit"
                  title={t("common.filter_and_sort")}
                >
                  <IconFilter size={22} />
                </Button>
                <Link
                  href="/issues"
                  lang={state.language.code}
                  title={t("common.filter_and_sort_reset")}
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
                {t("common.edit")}
              </Link>
            ),
          },
        ]}
      >
        <TableHeader>
          <TableRow key="header">
            {({ cell }) => (
              <TableCell
                as="th"
                class="align-bottom"
                scope="col"
              >
                {cell}
              </TableCell>
            )}
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

      {!!data.cursor.length && (
        <Link
          href={`?cursor=${data.cursor}&${searchParams.toString()}`}
        >
          {t("common.view_more")}
        </Link>
      )}
    </>
  );
}

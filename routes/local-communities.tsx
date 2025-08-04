import { Table } from "$components/Table/Table.tsx";
import { TableBody } from "$components/Table/TableBody.tsx";
import { TableCell } from "$components/Table/TableCell.tsx";
import { TableHeader } from "$components/Table/TableHeader.tsx";
import { TableRow } from "$components/Table/TableRow.tsx";
import type { Handlers, PageProps } from "$fresh/server.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import {
  getLocalCommunities,
  type LocalCommunity,
} from "$models/local-community.ts";
import type { AppState } from "$types/app.ts";
import { Link } from "../components/Link.tsx";
import { IconExternalLink } from "../icons.ts";

interface Data {
  communities: LocalCommunity[];
}

export const handler: Handlers<Data, AppState> = {
  async GET(_, ctx) {
    const communities = await Array.fromAsync(getLocalCommunities());

    return await ctx.render({ communities });
  },
};

export default function LocalCommunitiesPage(
  props: PageProps<Data, AppState>,
) {
  const { data } = props;
  const { t, fromObject } = useTranslation();

  return (
    <Table
      items={data.communities}
      columns={[
        {
          id: "community",
          header: t("common.local_community"),
          cell: (item) => fromObject(item, "name") as string,
        },
        {
          "id": "phone",
          header: t("common.phone"),
          cell: (item) => (
            <span class="flex flex-col gap-1">
              {item.phone.map((phone) => <span key={phone}>{phone}</span>)}
            </span>
          ),
        },
        {
          id: "link",
          header: t("common.link"),
          cell: (item) => (
            <Link
              href={item.link}
              target="_blank"
            >
              <IconExternalLink size={18} />
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
  );
}

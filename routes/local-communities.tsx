import { Link } from "@/components/Link.tsx";
import { Table } from "@/components/Table/Table.tsx";
import { TableBody } from "@/components/Table/TableBody.tsx";
import { TableCell } from "@/components/Table/TableCell.tsx";
import { TableHeader } from "@/components/Table/TableHeader.tsx";
import { TableRow } from "@/components/Table/TableRow.tsx";
import { useTranslation } from "@/hooks/useTranslation.ts";
import { IconExternalLink } from "@/icons.ts";
import { getLocalCommunities } from "@/models/local-community.ts";
import { define } from "@/types/app.ts";
import { page } from "fresh";

export const handler = define.handlers({
  async GET() {
    const communities = await Array.fromAsync(getLocalCommunities());

    return page({ communities });
  },
});

export default define.page<typeof handler>((props) => {
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
              title={item.link}
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
});

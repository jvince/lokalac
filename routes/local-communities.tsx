import type { Handlers, PageProps } from "$fresh/server.ts";
import {
  getLocalCommunities,
  type LocalCommunity,
} from "$models/local-community.ts";
import type { AppState } from "$types/app.ts";
import { Link } from "../components/Link.tsx";

interface PageData {
  list: LocalCommunity[];
}

export const handler: Handlers<PageData, AppState> = {
  async GET(_, ctx) {
    const list = await Array.fromAsync(getLocalCommunities());

    return await ctx.render({ list });
  },
};

export default function LocalCommunitiesPage(
  { data: { list } }: PageProps<PageData>,
) {
  return (
    <div class="flex flex-col items-center justify-center">
      <table class="table">
        <thead>
          <tr>
            <th>Community</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr>
              <td>
                <Link href={item.link} target="_blank">{item.name}</Link>
              </td>
              <td>{item.phone.map((item) => <div>{item}</div>)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

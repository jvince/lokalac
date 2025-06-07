import { defineRoute, Handlers } from "$fresh/server.ts";
import { getIssues, IssueDTO } from "$models/issue.ts";
import { AppState } from "$types/app.ts";

export const handler: Handlers<PageData, AppState> = {
  async GET(_req, ctx) {
    const issues = await Array.fromAsync(getIssues());

    return await ctx.render({ issues });
  },
};

interface PageData {
  issues: IssueDTO[];
}

export default defineRoute(() => {
  return <div>Kesa</div>;
});

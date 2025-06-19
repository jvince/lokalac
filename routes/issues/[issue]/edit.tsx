import { Handlers, PageProps } from "$fresh/server.ts";
import { AppState } from "$types/app.ts";
import { getIssueById, type Issue } from "$models/issue.ts";
import { basicAuth } from "../../../auth/basicAuth.ts";

interface PageData {
  issue: Issue | null;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const unauthorized = basicAuth(req);

    if (unauthorized) {
      return unauthorized;
    }

    const issue = await getIssueById(ctx.params.issue);
    return await ctx.render({ issue });
  },
};

export default function EditPage(props: PageProps<PageData, AppState>) {
  if (!props.data.issue) {
    return <div>Issue not found</div>;
  }

  return (
    <div>
      {JSON.stringify(props.data.issue, null, 2)}
      <h1>Edit Issue</h1>
    </div>
  );
}

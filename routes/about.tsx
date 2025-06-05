import { Handlers, PageProps } from "$fresh/server.ts";
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

export default function AboutPage(
  { data }: PageProps<PageData, AppState>,
) {
  return (
    <>
      <h1>About</h1>
      <p>This is the about page of our application.</p>
      <ul>
        {data.issues.map((issue) => (
          <li key={issue.id}>
            <pre>
            {JSON.stringify(issue, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </>
  );
}

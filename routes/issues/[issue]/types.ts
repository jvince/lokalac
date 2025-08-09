import { PageProps } from "$fresh/server.ts";
import { Issue } from "$models/issue.ts";
import { AppState } from "$types/app.ts";

export interface IssuePageData {
  issue: Issue | null;
}

export interface IssuePageProps extends PageProps<IssuePageData, AppState> {}

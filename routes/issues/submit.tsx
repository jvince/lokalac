import { Handlers, PageProps } from "$fresh/server.ts";
import { getIssueCategories, IssueCategory } from "$models/issue-category.ts";
import { getIssueTypes, IssueType } from "$models/issue-type.ts";
import {
  getLocalCommunities,
  LocalCommunity,
} from "$models/local-community.ts";
import { AppState } from "$types/app.ts";
import { IssueForm } from "../../islands/IssueForm.tsx";

interface PageData {
  categories: IssueCategory[];
  communities: LocalCommunity[];
  issueTypes: IssueType[];
}

export const handler: Handlers<PageData, AppState> = {
  async GET(_req, ctx) {
    const communities = await Array.fromAsync(getLocalCommunities());
    const categories = await Array.fromAsync(getIssueCategories());
    const issues = await Array.fromAsync(getIssueTypes());

    return ctx.render({ categories, communities, issueTypes: issues });
  },
};

export default function SubmitIssuePage(
  { data, state }: PageProps<PageData, AppState>,
) {
  return (
    <IssueForm
      i18nState={{ language: state.language, translation: state.translation }}
      categories={data.categories}
      communities={data.communities}
      issueTypes={data.issueTypes}
    />
  );
}

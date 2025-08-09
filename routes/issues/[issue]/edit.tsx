import { Link } from "$components/Link.tsx";
import { Handlers } from "$fresh/server.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import { getIssueById } from "$models/issue.ts";
import { WithAuthorization } from "../../../auth/withAuthorization.ts";
import { IssuePageProps } from "./types.ts";

export const handler: Handlers = {
  GET: WithAuthorization(async (_, ctx) => {
    const issue = await getIssueById(ctx.params.issue);
    return await ctx.render({ issue });
  }),
};

export default function EditPage(props: IssuePageProps) {
  const { data } = props;
  const { t, language } = useTranslation();

  if (!data.issue) {
    return <div>{t("common.issue_not_found")}</div>;
  }

  return (
    <div>
      {JSON.stringify(props.data.issue, null, 2)}
      <h1>Edit Issue</h1>

      <Link
        as="btn"
        color="warning"
        href={`/issues/${data.issue.id}/delete`}
        lang={language.code}
      >
        {t("common.delete")}
      </Link>
    </div>
  );
}

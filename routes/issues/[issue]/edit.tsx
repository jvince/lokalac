import { WithAuthorization } from "@/auth/withAuthorization.ts";
import { Link } from "@/components/Link.tsx";
import { useTranslation } from "@/hooks/useTranslation.ts";
import { getIssueById } from "@/models/issue.ts";
import { define } from "@/types/app.ts";
import { page } from "fresh";

export const handler = define.handlers({
  GET: WithAuthorization(async (ctx) => {
    const issue = await getIssueById(ctx.params.issue);
    return page({ issue });
  }),
});

export default define.page<typeof handler>((props) => {
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
});

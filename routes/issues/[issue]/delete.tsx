import { Button } from "@/components/Button.tsx";
import { Form } from "@/components/Form.tsx";
import { Link } from "@/components/Link.tsx";
import { useTranslation } from "@/hooks/useTranslation.ts";
import { deleteIssue, getIssueById } from "@/models/issue.ts";
import { WithAuthorization } from "@/auth/withAuthorization.ts";
import { define } from "@/types/app.ts";
import { page } from "fresh";

export const handler = define.handlers({
  GET: WithAuthorization(async (ctx) => {
    const issue = await getIssueById(ctx.params.issue);

    return page({ issue });
  }),

  POST: WithAuthorization(async (ctx) => {
    const formData = await ctx.req.formData();
    const id = formData.get("id");

    if (typeof id !== "string") {
      return page({ issue: null });
    }

    const lang = formData.get("lang");
    const searchParams = new URLSearchParams();

    if (typeof lang === "string") {
      searchParams.set("lang", lang);
    }

    await deleteIssue(id);

    return new Response(null, {
      status: 303,
      headers: {
        Location: `/issues?${searchParams.toString()}`,
      },
    });
  }),
});

export default define.page<typeof handler>((props) => {
  const { data } = props;
  const { t, language } = useTranslation();

  if (!data.issue) {
    return <div>{t("common.issue_not_found")}</div>;
  }

  return (
    <Form
      lang={language.code}
      method="POST"
    >
      <Link
        as="btn"
        href={`/issues/${data.issue.id}/edit`}
        lang={language.code}
      >
        {t("common.back")}
      </Link>

      <Button type="submit" color="warning">
        <input name="id" value={data.issue.id} type="hidden" />
        {t("common.delete")}
      </Button>
    </Form>
  );
});

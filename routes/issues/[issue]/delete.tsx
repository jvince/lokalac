import { WithAuthorization } from "@/auth/withAuthorization.ts";
import { Button } from "@/components/Button.tsx";
import { Form } from "@/components/Form.tsx";
import { Link } from "@/components/Link.tsx";
import { useTranslation } from "@/hooks/useTranslation.ts";
import { deleteIssue, getIssueById, type IssueDTO } from "@/models/issue.ts";
import { define } from "@/types/app.ts";
import { page } from "fresh";
import { normalizeIssueListReturnUrl } from "@/utils/url.ts";
import { defaultLanguage } from "@/languages.ts";

export const handler = define.handlers({
  GET: WithAuthorization(async (ctx) => {
    const issue = await getIssueById(ctx.params.issue);
    const returnTo = normalizeIssueListReturnUrl(
      ctx.url.searchParams.get("return_to"),
      ctx.state.language?.code ?? defaultLanguage.code,
    );

    return page({ issue, returnTo });
  }),

  POST: WithAuthorization(async (ctx) => {
    const formData = await ctx.req.formData();
    const id = ctx.params.issue;

    const returnTo = normalizeIssueListReturnUrl(
      typeof formData.get("return_to") === "string"
        ? formData.get("return_to") as string
        : null,
      ctx.state.language?.code ?? defaultLanguage.code,
    );

    const result = await deleteIssue(id);

    switch (result.status) {
      case "invalid_id":
      case "not_found": {
        return new Response(null, {
          status: 404,
        });
      }
      case "deleted": {
        return new Response(null, {
          status: 303,
          headers: {
            Location: returnTo,
          },
        });
      }
    }
  }),
});

export default define.page<
  typeof handler,
  { issue: IssueDTO | null; returnTo: string }
>(
  (props) => {
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
          href={data.returnTo}
        >
          {t("common.back")}
        </Link>

        <Button type="submit" color="warning">
          {t("common.delete")}
        </Button>
        <input type="hidden" name="return_to" value={data.returnTo} />
      </Form>
    );
  },
);

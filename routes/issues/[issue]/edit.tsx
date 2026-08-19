import { WithAuthorization } from "@/auth/withAuthorization.ts";
import { useTranslation } from "@/hooks/useTranslation.ts";
import { IssueForm } from "@/islands/IssueForm.tsx";
import { getIssueCategoriesAsArray } from "@/models/issue-category.ts";
import { formDataToIssueEdit } from "@/models/issue-edit.ts";
import { getIssueTypesAsArray } from "@/models/issue-type.ts";
import {
  getIssueSnapshot,
  IssueNotFoundError,
  type IssueSnapshot,
  IssueUpdateConflictError,
  updateIssue,
} from "@/models/issue.ts";
import {
  getLocalCommunitiesAsArray,
  getLocalCommunityPolygonById,
} from "@/models/local-community.ts";
import {
  readLimitedFormData,
  RequestBodyTooLargeError,
} from "@/services/requestBody.ts";
import { validateIssueSubmissionDomain } from "@/services/issueSubmission.ts";
import { define } from "@/types/app.ts";
import { addQueryParameter, normalizeIssueListReturnUrl } from "@/utils/url.ts";
import { page } from "fresh";

export const MAX_ISSUE_EDIT_BODY_SIZE = 64 * 1024;

async function loadFormData() {
  const [communities, categories, issueTypes] = await Promise.all([
    getLocalCommunitiesAsArray(),
    getIssueCategoriesAsArray(),
    getIssueTypesAsArray(),
  ]);
  return { categories, communities, issueTypes };
}

function snapshotFormValues(snapshot: IssueSnapshot) {
  const issue = snapshot.issue;
  return {
    categoryId: issue.categoryId,
    communityId: issue.communityId,
    location: issue.location,
    note: issue.note,
    status: issue.status,
    typeId: issue.typeId,
  };
}

async function editPageData(
  snapshot: IssueSnapshot | null,
  returnTo: string,
  errors: string[] = [],
  formValues = snapshot ? snapshotFormValues(snapshot) : {},
  versionstamp = snapshot?.versionstamp ?? "",
) {
  return {
    ...await loadFormData(),
    errors,
    formValues,
    returnTo,
    snapshot,
    versionstamp,
  };
}

export const handler = define.handlers({
  GET: WithAuthorization(async (ctx) => {
    const returnTo = normalizeIssueListReturnUrl(
      ctx.url.searchParams.get("return_to"),
      ctx.state.language.code,
    );
    const snapshot = await getIssueSnapshot(ctx.params.issue);
    return page(
      await editPageData(snapshot, returnTo),
      snapshot ? undefined : { status: 404 },
    );
  }),

  POST: WithAuthorization(async (ctx) => {
    let formData: FormData;
    try {
      formData = await readLimitedFormData(ctx.req, MAX_ISSUE_EDIT_BODY_SIZE);
    } catch (error) {
      const snapshot = await getIssueSnapshot(ctx.params.issue);
      const returnTo = normalizeIssueListReturnUrl(
        null,
        ctx.state.language.code,
      );
      return page(
        await editPageData(snapshot, returnTo, [
          error instanceof RequestBodyTooLargeError
            ? "error.request_body_too_large"
            : "error.invalid_form_submission",
        ]),
        { status: error instanceof RequestBodyTooLargeError ? 413 : 400 },
      );
    }

    const returnTo = normalizeIssueListReturnUrl(
      typeof formData.get("return_to") === "string"
        ? formData.get("return_to") as string
        : null,
      ctx.state.language.code,
    );
    const snapshot = await getIssueSnapshot(ctx.params.issue);
    if (!snapshot) {
      return page(await editPageData(null, returnTo), { status: 404 });
    }

    const { input, formValues } = formDataToIssueEdit(formData);
    const formDataOptions = await loadFormData();
    if (!input.success) {
      return page({
        ...formDataOptions,
        errors: input.issues.map((issue) => issue.message),
        formValues,
        returnTo,
        snapshot,
        versionstamp: typeof formData.get("versionstamp") === "string"
          ? formData.get("versionstamp") as string
          : snapshot.versionstamp,
      }, { status: 400 });
    }

    const polygon = input.output.location
      ? await getLocalCommunityPolygonById(input.output.communityId)
      : null;
    const errors = validateIssueSubmissionDomain(
      { ...input.output, images: [] },
      { ...formDataOptions, polygon },
    );
    if (errors.length) {
      return page({
        ...formDataOptions,
        errors,
        formValues,
        returnTo,
        snapshot,
        versionstamp: input.output.versionstamp,
      }, { status: 400 });
    }

    try {
      await updateIssue(
        ctx.params.issue,
        {
          categoryId: input.output.categoryId,
          communityId: input.output.communityId,
          location: input.output.location,
          note: input.output.note,
          status: input.output.status,
          typeId: input.output.typeId,
          updatedAt: Temporal.Now.zonedDateTimeISO().toString(),
        },
        undefined,
        input.output.versionstamp,
      );
    } catch (error) {
      if (error instanceof IssueNotFoundError) {
        return page(await editPageData(null, returnTo), { status: 404 });
      }
      if (error instanceof IssueUpdateConflictError) {
        const latest = await getIssueSnapshot(ctx.params.issue);
        return page(
          await editPageData(latest, returnTo, ["error.issue_update_conflict"]),
          { status: 409 },
        );
      }

      console.error(`Failed to update issue ${ctx.params.issue}:`, error);
      return page(
        await editPageData(snapshot, returnTo, ["error.issue_update_failed"]),
        { status: 500 },
      );
    }

    return new Response(null, {
      status: 303,
      headers: { Location: addQueryParameter(returnTo, "updated", "1") },
    });
  }),
});

export default define.page<typeof handler>((ctx) => {
  const { data, state } = ctx;
  const { t } = useTranslation();

  if (!data.snapshot) {
    return <div class="alert alert-error">{t("common.issue_not_found")}</div>;
  }

  return (
    <>
      {data.errors.map((error) => (
        <div class="alert alert-error" key={error}>
          {t(`common.${error}`)}
        </div>
      ))}
      <IssueForm
        _ctx={{
          baseURL: ctx.url.origin,
          language: state.language,
          translation: state.translation,
          path: `${ctx.url.pathname}${ctx.url.search}`,
        }}
        action={`/issues/${data.snapshot.issue.id}/edit`}
        cancelHref={data.returnTo}
        categories={data.categories}
        communities={data.communities}
        deleteHref={`/issues/${data.snapshot.issue.id}/delete?return_to=${
          encodeURIComponent(data.returnTo)
        }`}
        existingImages={data.snapshot.issue.images}
        formValues={data.formValues}
        i18nState={state}
        issueTypes={data.issueTypes}
        returnTo={data.returnTo}
        showImageUpload={false}
        showStatus
        submitLabel={t("common.save")}
        versionstamp={data.versionstamp}
      />
    </>
  );
});

import { useTranslation } from "@/hooks/useTranslation.ts";
import { IssueForm } from "@/islands/IssueForm.tsx";
import { getIssueCategoriesAsArray } from "@/models/issue-category.ts";
import { formDataToIssue } from "@/models/issue-submission.ts";
import { getIssueTypesAsArray } from "@/models/issue-type.ts";
import { insertIssue, IssueStatus } from "@/models/issue.ts";
import {
  getLocalCommunitiesAsArray,
  getLocalCommunityPolygonById,
} from "@/models/local-community.ts";
import {
  ImageValidationError,
  processImagesAndPersist,
} from "@/services/imageProcessing.ts";
import {
  readLimitedFormData,
  RequestBodyTooLargeError,
} from "@/services/requestBody.ts";
import { SemaphoreTimeoutError } from "@/services/semaphore.ts";
import { submissionQuota } from "@/services/submissionQuota.ts";
import { validateIssueSubmissionDomain } from "@/services/issueSubmission.ts";
import { define } from "@/types/app.ts";
import { textResponse } from "@/utils/http.ts";
import { getRemoteAddr } from "@/utils/net.ts";
import { monotonicUlid } from "@std/ulid";
import { page } from "fresh";
import type { LatLngTuple } from "leaflet";

export const MAX_SUBMISSION_BODY_SIZE = 52 * 1024 * 1024;

async function loadData() {
  const communities = await getLocalCommunitiesAsArray();
  const categories = await getIssueCategoriesAsArray();
  const issueTypes = await getIssueTypesAsArray();

  return { categories, communities, issueTypes };
}

export function getLatLngBounds(polygon: LatLngTuple[] | undefined | null) {
  if (!polygon || !Array.isArray(polygon) || polygon.length === 0) {
    return [
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    ];
  }

  let southWest = polygon[0];
  let northEast = polygon[0];

  for (const [lat, lng] of polygon) {
    if (lat < southWest[0]) {
      southWest = [lat, southWest[1]];
    }
    if (lng < southWest[1]) {
      southWest = [southWest[0], lng];
    }
    if (lat > northEast[0]) {
      northEast = [lat, northEast[1]];
    }
    if (lng > northEast[1]) {
      northEast = [northEast[0], lng];
    }
  }

  return [southWest, northEast];
}

export const handler = define.handlers({
  async GET() {
    return page({ ...await loadData(), errors: [], formValues: {} });
  },

  async POST(ctx) {
    let remoteAddr: string;

    try {
      remoteAddr = getRemoteAddr(ctx);
    } catch {
      return textResponse("Unable to identify the requesting client.", 500);
    }

    const quotaResponse = submissionQuota(remoteAddr);

    if (quotaResponse) {
      return quotaResponse;
    }

    let formData: FormData;

    try {
      formData = await readLimitedFormData(
        ctx.req,
        MAX_SUBMISSION_BODY_SIZE,
      );
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        return page({
          ...await loadData(),
          errors: ["error.request_body_too_large"],
          formValues: {},
        }, { status: 413 });
      }

      return page({
        ...await loadData(),
        errors: ["error.invalid_form_submission"],
        formValues: {},
      }, { status: 400 });
    }

    const { input, formValues } = formDataToIssue(formData);
    const { categories, communities, issueTypes } = await loadData();
    if (!input.success) {
      return page({
        categories,
        communities,
        issueTypes,
        errors: input.issues.map((issue) => issue.message),
        formValues,
      }, { status: 400 });
    }

    const polygon = input.output.location
      ? await getLocalCommunityPolygonById(input.output.communityId)
      : null;
    const errors = validateIssueSubmissionDomain(input.output, {
      categories,
      communities,
      issueTypes,
      polygon,
    });

    if (errors.length > 0) {
      return page({
        categories,
        communities,
        issueTypes,
        errors,
        formValues,
      }, { status: 400 });
    }
    const id = monotonicUlid();
    const createdAt = Temporal.Now.zonedDateTimeISO().toString();

    try {
      await processImagesAndPersist(
        id,
        input.output.images,
        {},
        async (images) => {
          await insertIssue({
            id,
            communityId: input.output.communityId,
            categoryId: input.output.categoryId,
            typeId: input.output.typeId,
            status: IssueStatus.Open,
            location: input.output.location,
            note: input.output.note,
            createdAt,
            updatedAt: createdAt,
            images,
          });
        },
      );
    } catch (error) {
      console.error(`Failed to submit issue ${id}:`, error);

      if (error instanceof SemaphoreTimeoutError) {
        return new Response("Image processing is busy. Try again shortly.", {
          status: 503,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Retry-After": "5",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }

      if (error instanceof ImageValidationError) {
        return page({
          categories,
          communities,
          issueTypes,
          errors: [error.message],
          formValues,
        }, { status: 400 });
      }

      return page({
        categories,
        communities,
        issueTypes,
        errors: ["error.issue_submission_failed"],
        formValues,
      }, { status: 500 });
    }

    return new Response(null, {
      status: 303,
      headers: {
        Location: `/issues?lang=${formData.get("lang")}`,
      },
    });
  },
});

export default define.page<typeof handler>((ctx) => {
  const { data, state } = ctx;
  const { t } = useTranslation();

  return (
    <>
      {(data.errors ?? []).map((error) => {
        return (
          <div class="alert alert-error">
            <span>
              {error.startsWith("error.") ? t(`common.${error}`) : error}
            </span>
          </div>
        );
      })}

      <IssueForm
        _ctx={{
          baseURL: ctx.url.origin,
          language: state.language,
          translation: state.translation,
          path: `${ctx.url.pathname}${ctx.url.search}`,
        }}
        categories={data.categories}
        communities={data.communities}
        formValues={data.formValues}
        i18nState={state}
        issueTypes={data.issueTypes}
      />
    </>
  );
});

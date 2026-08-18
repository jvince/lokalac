import { appConfig } from "@/config.ts";
import { useTranslation } from "@/hooks/useTranslation.ts";
import { IssueForm } from "@/islands/IssueForm.tsx";
import { getIssueCategoriesAsArray } from "@/models/issue-category.ts";
import { formDataToIssue } from "@/models/issue-submission.ts";
import { getIssueTypesAsArray } from "@/models/issue-type.ts";
import {
  insertIssue,
  type IssueLocation,
  IssueStatus,
} from "@/models/issue.ts";
import {
  getLocalCommunitiesAsArray,
  getLocalCommunityPolygonById,
  type LocalCommunity,
} from "@/models/local-community.ts";
import { define } from "@/types/app.ts";
import { ensureDir } from "@std/fs";
import { monotonicUlid } from "@std/ulid";
import { page } from "fresh";
import type { LatLngTuple } from "leaflet";
import sharp, { type Metadata as ImageMetadata } from "sharp";

type ImageOrientation = "landscape" | "portrait";

const MAX_IMAGE_PIXELS = 40_000_000;
const ALLOWED_SHARP_IMAGE_FORMATS = new Set(["jpeg", "png", "webp"]);

function getOrientation(metadata: ImageMetadata): ImageOrientation {
  if (typeof metadata.orientation === "number") {
    return metadata.orientation >= 5 ? "landscape" : "portrait";
  }

  return metadata.width > metadata.height ? "landscape" : "portrait";
}

async function processImages(id: string, files: File[]) {
  if (!files.length) {
    return [];
  }

  const uploadDir = `./${appConfig.uploadDir}/${id}`;
  await ensureDir(uploadDir);
  const imageUrls: string[] = [];

  for await (const file of files) {
    const fileName = `${crypto.randomUUID()}.webp`;
    const uploadPath = `/${uploadDir}/${fileName}`;

    const image = sharp(await file.bytes(), {
      limitInputPixels: MAX_IMAGE_PIXELS,
    });
    const metadata = await image.metadata();

    if (
      !metadata.format || !ALLOWED_SHARP_IMAGE_FORMATS.has(metadata.format)
    ) {
      throw new Error("error.image_invalid_type");
    }

    if (metadata.pages && metadata.pages > 1) {
      throw new Error("error.animated_image_not_allowed");
    }

    const isLandscape = getOrientation(metadata) === "landscape";
    const size = isLandscape ? { width: 1920 } : { height: 1080 };
    const buffer = await image.resize({
      ...size,
      withoutEnlargement: true,
    }).webp().toBuffer();

    await Deno.writeFile(`.${uploadPath}`, buffer);
    imageUrls.push(uploadPath);
  }

  return imageUrls;
}

async function removeProcessedImages(id: string) {
  const uploadDir = `./${appConfig.uploadDir}/${id}`;

  try {
    await Deno.remove(uploadDir, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      console.error(`Failed to clean up images for issue ${id}:`, error);
    }
  }
}

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

/**
 * @todo: Implement more robust location validation.
 */
async function isLocationInPolygon(
  location: IssueLocation | undefined,
  community: LocalCommunity | undefined,
) {
  if (!location || !community) {
    return false;
  }

  const polygon = await getLocalCommunityPolygonById(community.id);
  const [southWest, northEast] = getLatLngBounds(polygon);

  return (
    location.lat >= southWest[0] && location.lat <= northEast[0] &&
    location.lng >= southWest[1] && location.lng <= northEast[1]
  );
}

export const handler = define.handlers({
  async GET() {
    return page({ ...await loadData(), errors: [], formValues: {} });
  },

  async POST(ctx) {
    const formData = await ctx.req.formData();
    const { input, formValues } = formDataToIssue(formData);
    const { categories, communities, issueTypes } = await loadData();
    const errors: string[] = [];

    if (!input.success) {
      return page({
        categories,
        communities,
        issueTypes,
        errors: input.issues.map((issue) => issue.message),
        formValues,
      });
    }

    const issueType = issueTypes.find((i) => i.id === input.output.typeId);

    if (!communities.find((c) => c.id === input.output.communityId)) {
      errors.push("error.local_community_not_found");
    }

    if (!categories.find((c) => c.id === input.output.categoryId)) {
      errors.push("error.issue_category_not_found");
    }

    if (!issueType) {
      errors.push("error.issue_type_not_found");
    } else if (issueType.category !== input.output.categoryId) {
      errors.push("error.issue_type_not_in_category");
    }

    if (
      input.output.location &&
      !(await isLocationInPolygon(
        input.output.location,
        communities.find((c) => c.id === input.output.communityId),
      ))
    ) {
      errors.push("error.location_not_in_community_polygon");
    }

    if (errors.length > 0) {
      return page({
        categories,
        communities,
        issueTypes,
        errors,
        formValues,
      });
    }
    const id = monotonicUlid();
    const createdAt = Temporal.Now.zonedDateTimeISO().toString();

    try {
      const images = await processImages(id, input.output.images);

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
    } catch (error) {
      console.error(`Failed to submit issue ${id}:`, error);
      await removeProcessedImages(id);

      return page({
        categories,
        communities,
        issueTypes,
        errors: ["error.issue_submission_failed"],
        formValues,
      });
    }

    console.log(
      `Reported issue ${input.output.typeId} in category ${input.output.categoryId} for community ${input.output.communityId}`,
    );

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
          path: ctx.url.pathname,
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

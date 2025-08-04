import { Handlers, PageProps } from "$fresh/server.ts";
import { IssueForm, IssueFormValues } from "$islands/IssueForm.tsx";
import {
  getIssueCategories,
  type IssueCategory,
} from "$models/issue-category.ts";
import { getIssueTypes, type IssueType } from "$models/issue-type.ts";
import { insertIssue, type IssueLocation, IssueStatus } from "$models/issue.ts";
import {
  getLocalCommunities,
  getLocalCommunityPolygonById,
  type LocalCommunity,
} from "$models/local-community.ts";
import { AppState } from "$types/app.ts";
import { ulid } from "@std/ulid";
import type { LatLngTuple } from "leaflet";

interface PageData {
  categories: IssueCategory[];
  communities: LocalCommunity[];
  issueTypes: IssueType[];
  errors?: string[];
  formValues?: IssueFormValues;
}

async function loadData() {
  const communities = await Array.fromAsync(getLocalCommunities());
  const categories = await Array.fromAsync(getIssueCategories());
  const issueTypes = await Array.fromAsync(getIssueTypes());

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

export const handler: Handlers<PageData, AppState> = {
  async GET(_req, ctx) {
    return ctx.render(await loadData());
  },

  async POST(req, ctx) {
    const formData = await req.formData();
    const { categories, communities, issueTypes } = await loadData();

    let community: LocalCommunity | undefined;
    let category: IssueCategory | undefined;
    let issueType: IssueType | undefined;
    let note: string | undefined;
    let location: IssueLocation | undefined;
    const errors: string[] = [];

    try {
      for (const [key, value] of formData.entries()) {
        if (key === "local_community") {
          community = communities.find((c) => c.id === value);
          if (!community) {
            errors.push("error.local_community_not_found");
          }
        }
        if (key === "issue_category") {
          category = categories.find((c) => c.id === value);
          if (!category) {
            errors.push("error.issue_category_not_found");
          }
        }
        if (key === "issue_type") {
          issueType = issueTypes.find((i) => i.id === value);
          if (!issueType) {
            errors.push("error.issue_type_not_found");
          }
        }
        if (
          key === "location" && typeof value === "string" && value.length > 0
        ) {
          try {
            const locationValue = JSON.parse(value);
            if (
              typeof locationValue === "object" &&
              "lat" in locationValue &&
              "lng" in locationValue &&
              typeof locationValue.lat === "number" &&
              typeof locationValue.lng === "number"
            ) {
              location = {
                lat: locationValue.lat,
                lng: locationValue.lng,
              };
            }
          } catch {
            throw new Error("error.invalid_location_format");
          }

          if (!(await isLocationInPolygon(location, community))) {
            throw new Error("error.location_not_in_community_polygon");
          }
        }

        if (key === "note" && typeof value === "string") {
          note = value;
        }
      }

      if (community && category && issueType) {
        console.log(
          `Reported issue ${issueType.name} in category ${category.name} for community ${community.name}`,
        );

        const createdAt = Temporal.Now.zonedDateTimeISO().toString();

        await insertIssue({
          id: ulid(),
          communityId: community.id,
          categoryId: category.id,
          typeId: issueType.id,
          status: IssueStatus.Open,
          location,
          note,
          createdAt,
          updatedAt: createdAt,
        });

        return new Response(null, {
          status: 303,
          headers: {
            Location: `/issues?lang=${formData.get("lang")}`,
          },
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      }
    }

    return ctx.render({
      categories,
      communities,
      issueTypes,
      errors,
      formValues: {
        localCommunity: community?.id,
        issueCategory: category?.id,
        issueType: issueType?.id,
        location,
        note,
      },
    });
  },
};

export default function SubmitIssuePage(
  { data, state }: PageProps<PageData, AppState>,
) {
  return (
    <>
      {(data.errors ?? []).map((error) => {
        return (
          <div class="alert alert-error">
            <span>{error}</span>
          </div>
        );
      })}
      <IssueForm
        categories={data.categories}
        communities={data.communities}
        formValues={data.formValues}
        i18nState={state}
        issueTypes={data.issueTypes}
      />
    </>
  );
}

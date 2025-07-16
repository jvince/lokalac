import { Handlers, PageProps } from "$fresh/server.ts";
import { getIssueCategories, IssueCategory } from "$models/issue-category.ts";
import { getIssueTypes, IssueType } from "$models/issue-type.ts";
import { insertIssue, IssueLocation, IssueStatus } from "$models/issue.ts";
import {
  getLocalCommunities,
  LocalCommunity,
} from "$models/local-community.ts";
import { AppState } from "$types/app.ts";
import { IssueForm, IssueFormValues } from "$islands/IssueForm.tsx";

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
        }
        if (key === "issue_category") {
          category = categories.find((c) => c.id === value);
        }
        if (key === "issue_type") {
          issueType = issueTypes.find((i) => i.id === value);
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
        }
        if (key === "note") {
          note = value as string;
        }
      }

      if (!community) {
        errors.push("error.local_community_not_found");
      }
      if (!category) {
        errors.push("error.issue_category_not_found");
      }
      if (!issueType) {
        errors.push("error.issue_type_not_found");
      }

      if (community && category && issueType) {
        console.log(
          `Reported issue ${issueType.name} in category ${category.name} for community ${community.name}`,
        );

        await insertIssue({
          id: crypto.randomUUID(),
          communityId: community.id,
          categoryId: category.id,
          typeId: issueType.id,
          status: IssueStatus.Open,
          location,
          note,
          submittedAt: Temporal.Now.zonedDateTimeISO().toString(),
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
        i18nState={{ language: state.language, translation: state.translation }}
        categories={data.categories}
        communities={data.communities}
        issueTypes={data.issueTypes}
        formValues={data.formValues}
      />
    </>
  );
}

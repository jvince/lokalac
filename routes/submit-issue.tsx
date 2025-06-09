import { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import { getIssueCategories } from "$models/issue-category.ts";
import { getIssueTypes, IssueType } from "$models/issue-type.ts";
import { insertIssue, IssueStatus } from "$models/issue.ts";
import {
  getLocalCommunities,
  LocalCommunity,
} from "$models/local-community.ts";
import { AppState } from "$types/app.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import { IssueForm } from "../islands/IssueForm.tsx";
import { useGlobalContext } from "../globalContext.ts";

export interface IssueCategory {
  id: string;
  name: string;
  description: string;
}

interface Props {
  issues: IssueType[];
  communities: LocalCommunity[];
  categories: IssueCategory[];
}

export const handler: Handlers<Props, AppState> = {
  async GET(_req, ctx) {
    const communities = await Array.fromAsync(getLocalCommunities());
    const categories = await Array.fromAsync(getIssueCategories());
    const issues = await Array.fromAsync(getIssueTypes());

    return ctx.render({ categories, communities, issues });
  },

  async POST(req, ctx) {
    // try {
    //   const form = await req.formData();
    //   let metadata: sharp.Metadata = null!;

    //   for (const [key, value] of form.entries()) {
    //     if (value instanceof File) {
    //       try {
    //         metadata = await sharp(new Uint8Array(await value.arrayBuffer()))
    //           .metadata();

    //         if (metadata.exif) {
    //           console.log(exif(metadata.exif));
    //         }
    //       } catch {}
    //     }
    //   }

    //   const file = form.get("file1");

    //   if (file instanceof File) {
    //     console.log(file);
    //     if (!(await Deno.stat("./uploads")).isDirectory) {
    //       await Deno.mkdir("./uploads");
    //     }

    //     if (metadata.width && metadata.height) {
    //       const isLandscape = metadata.width > metadata.height;
    //       console.log(metadata.orientation);
    //       const size = isLandscape ? { width: 1920 } : { height: 1080 };

    //       const buffer = await sharp(new Uint8Array(await file.arrayBuffer()))
    //         .resize({
    //           ...size,
    //           withoutEnlargement: true,
    //         })
    //         .webp()
    //         .toBuffer();

    //       await Deno.writeFile(
    //         "./uploads/" + `${crypto.randomUUID()}.jpg`,
    //         buffer,
    //       );
    //     }
    //   }
    // } catch (e) {
    //   console.error(e);

    //   return new Response("", {
    //     status: 400,
    //   });
    // }

    const communities = await Array.fromAsync(getLocalCommunities());
    const categories = await Array.fromAsync(getIssueCategories());
    const issues = await Array.fromAsync(getIssueTypes());

    const formData = await req.formData();

    let community: LocalCommunity | undefined;
    let category: IssueCategory | undefined;
    let issue: any;
    let note: string | undefined;

    for (const [key, value] of formData.entries()) {
      if (key === "local_community") {
        community = communities.find((c) => c.id === value);
      }
      if (key === "issue_category") {
        category = categories.find((c) => c.id === value);
      }
      if (key === "issue_type") {
        issue = issues.find((i) => i.id === value);
      }

      if (key === "note") {
        note = value as string;
      }
    }

    if (community && category && issue) {
      console.log(
        `Reported issue ${issue.name} in category ${category.name} for community ${community.name}`,
      );

      await insertIssue({
        id: crypto.randomUUID(),
        communityId: community.id,
        categoryId: category.id,
        typeId: issue.id,
        status: IssueStatus.Open,
        note,
        submittedAt: new Date().toISOString(),
      });

      return new Response(null, {
        status: 303,
        headers: {
          Location: `/issues?lang=${formData.get("lang")}`,
        },
      });
    }

    return ctx.render({ categories, communities, issues });
  },
};

export default function SubmitIssuePage(props: PageProps<Props>) {
  const {
    data: {
      categories = [],
      communities = [],
      issues = [],
    } = {},
  } = props;

  return (
    <IssueForm
      issueTypes={issues}
      categories={categories}
      communities={communities}
    />
  );
}

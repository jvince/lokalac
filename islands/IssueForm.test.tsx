import { assertEquals, assertMatch } from "@std/assert";
import { renderToString } from "npm:preact-render-to-string@^6.6.3";
import hu from "@/translations/hu/common.json" with { type: "json" };
import { IssueForm } from "./IssueForm.tsx";

Deno.test("issue edit form preselects existing relationships", () => {
  const html = renderToString(
    <IssueForm
      _ctx={{
        baseURL: "http://localhost",
        language: { code: "hu", localizedName: "Magyar", package: "hu" },
        path: "/issues/id/edit?lang=hu",
        translation: { common: hu },
      }}
      categories={[{ id: "roads", name: "Roads", description: "" }]}
      communities={[{ id: "center", name: "Center", phone: [], link: "" }]}
      formValues={{
        categoryId: "roads",
        communityId: "center",
        typeId: "pothole",
      }}
      i18nState={{
        language: { code: "hu", localizedName: "Magyar", package: "hu" },
        translation: { common: hu },
      }}
      issueTypes={[{
        id: "pothole",
        category: "roads",
        name: "Pothole",
        description: "",
      }]}
      showImageUpload={false}
    />,
  );

  assertMatch(html, /<option value="center"\s+selected>/);
  assertMatch(html, /<option value="roads"\s+selected>/);
  assertMatch(html, /<option value="pothole"\s+selected>/);
  assertEquals(
    html.includes('<option disabled value="" selected>'),
    false,
  );
});

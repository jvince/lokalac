import { assertEquals, assertNotEquals } from "@std/assert";
import { hash, Variant } from "@felix/argon2";
import { relative } from "@std/path";
import { ulid } from "@std/ulid";

const testRoot = await Deno.makeTempDir({ prefix: "lokalac-edit-test-" });
const previousKvStorageDirectory = Deno.env.get("KV_STORAGE_DIR");
const previousUsername = Deno.env.get("BASIC_AUTH_USERNAME");
const previousPasswordHash = Deno.env.get("BASIC_AUTH_PASSWORD_HASH");

Deno.env.set("KV_STORAGE_DIR", relative(Deno.cwd(), `${testRoot}/data`));
Deno.env.set("BASIC_AUTH_USERNAME", "test");
Deno.env.set("BASIC_AUTH_PASSWORD_HASH", "test-placeholder");

const [route, issueModel, categoryModel, typeModel, communityModel, config] =
  await Promise.all([
    import("../routes/issues/[issue]/edit.tsx"),
    import("../models/issue.ts"),
    import("../models/issue-category.ts"),
    import("../models/issue-type.ts"),
    import("../models/local-community.ts"),
    import("../config.ts"),
  ]);
const { kv } = await import("../services/kv.ts");
config.appConfig.basicAuthUsername = "test";
config.appConfig.basicAuthPasswordHash = await hash("test", {
  variant: Variant.Argon2id,
});

const AUTHORIZATION = `Basic ${btoa("test:test")}`;

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) Deno.env.delete(name);
  else Deno.env.set(name, value);
}

function request(id: string, formData: URLSearchParams, authorized = true) {
  const headers = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
  });
  if (authorized) headers.set("Authorization", AUTHORIZATION);

  const req = new Request(`http://localhost/issues/${id}/edit`, {
    method: "POST",
    headers,
    body: formData,
  });
  return {
    info: {
      remoteAddr: { transport: "tcp", hostname: "127.0.0.1", port: 1234 },
    },
    params: { issue: id },
    req,
    state: { language: { code: "sr-Latn-RS" } },
    url: new URL(req.url),
  };
}

function getRequest(id: string, returnTo: string, authorized = true) {
  const headers = new Headers();
  if (authorized) headers.set("Authorization", AUTHORIZATION);
  const req = new Request(
    `http://localhost/issues/${id}/edit?return_to=${
      encodeURIComponent(returnTo)
    }`,
    { headers },
  );
  return {
    info: {
      remoteAddr: { transport: "tcp", hostname: "127.0.0.1", port: 1234 },
    },
    params: { issue: id },
    req,
    state: { language: { code: "sr-Latn-RS" } },
    url: new URL(req.url),
  };
}

function editData(versionstamp: string, returnTo = "/issues?status=open") {
  return new URLSearchParams({
    issue_category: "category",
    issue_type: "type",
    lang: "sr-Latn-RS",
    local_community: "community",
    location: JSON.stringify({ lat: 46.1, lng: 19.6 }),
    note: "Updated note",
    return_to: returnTo,
    status: issueModel.IssueStatus.Resolved,
    versionstamp,
  });
}

Deno.test("protected issue editing", async (t) => {
  const id = ulid();
  const createdAt = "2026-08-19T10:00:00Z";
  const issue = {
    id,
    communityId: "community",
    categoryId: "category",
    typeId: "type",
    status: issueModel.IssueStatus.Open,
    note: "Original",
    images: ["/upload/original.webp"],
    createdAt,
    updatedAt: createdAt,
  };

  try {
    await Promise.all([
      kv.set([communityModel.LocalCommunityIndex, "community"], {
        id: "community",
        name: "Community",
        phone: [],
        link: "",
      }),
      kv.set([communityModel.LocalCommunityPolygonIndex, "community"], [
        [46, 19],
        [46, 20],
        [47, 20],
        [47, 19],
        [46, 19],
      ]),
      kv.set([categoryModel.IssueCategoryIndex, "category"], {
        id: "category",
        name: "Category",
        description: "",
      }),
      kv.set([typeModel.IssueTypeIndex, "type"], {
        id: "type",
        name: "Type",
        description: "",
        category: "category",
      }),
    ]);
    await issueModel.insertIssue(issue, kv);

    await t.step(
      "loads current values and preserves list navigation",
      async () => {
        const response = await route.handler.GET(
          getRequest(id, "/issues?community=community&status=open") as never,
        ) as { data: Record<string, unknown> };
        const formValues = response.data.formValues as Record<string, unknown>;

        assertEquals(formValues.note, "Original");
        assertEquals(formValues.status, issueModel.IssueStatus.Open);
        assertEquals(
          response.data.returnTo,
          "/issues?community=community&status=open",
        );
        assertEquals(typeof response.data.versionstamp, "string");
      },
    );

    await t.step("rejects an unauthenticated save", async () => {
      const snapshot = await issueModel.getIssueSnapshot(id, kv);
      const response = await route.handler.POST(
        request(id, editData(snapshot!.versionstamp), false) as never,
      );
      assertEquals(response instanceof Response, true);
      assertEquals((response as Response).status, 401);
    });

    await t.step(
      "updates editable fields and preserves immutable data",
      async () => {
        const snapshot = await issueModel.getIssueSnapshot(id, kv);
        const response = await route.handler.POST(
          request(id, editData(snapshot!.versionstamp)) as never,
        );

        assertEquals(response instanceof Response, true);
        assertEquals((response as Response).status, 303);
        assertEquals(
          (response as Response).headers.get("Location"),
          "/issues?status=open&updated=1",
        );
        const updated = (await kv.get<typeof issue>(
          issueModel.getIssuePrimaryKey(id),
        )).value!;
        assertEquals(updated.id, id);
        assertEquals(updated.createdAt, createdAt);
        assertEquals(updated.images, issue.images);
        assertEquals(updated.note, "Updated note");
        assertEquals(updated.status, issueModel.IssueStatus.Resolved);
        assertNotEquals(updated.updatedAt, createdAt);
      },
    );

    await t.step(
      "rejects a stale save and returns current values",
      async () => {
        const stale = await issueModel.getIssueSnapshot(id, kv);
        await issueModel.updateIssue(id, { note: "Newer value" }, kv);
        const response = await route.handler.POST(
          request(id, editData(stale!.versionstamp)) as never,
        ) as { status: number; data: Record<string, unknown> };

        assertEquals(response.status, 409);
        assertEquals(response.data.errors, ["error.issue_update_conflict"]);
        assertEquals(
          (response.data.formValues as { note: string }).note,
          "Newer value",
        );
      },
    );

    await t.step("confines an external return URL", async () => {
      const snapshot = await issueModel.getIssueSnapshot(id, kv);
      const response = await route.handler.POST(
        request(
          id,
          editData(snapshot!.versionstamp, "https://example.com/issues"),
        ) as never,
      ) as Response;

      assertEquals(response.headers.get("Location"), "/issues?updated=1");
    });
  } finally {
    kv.close();
    await Deno.remove(testRoot, { recursive: true });
    restoreEnvironment("KV_STORAGE_DIR", previousKvStorageDirectory);
    restoreEnvironment("BASIC_AUTH_USERNAME", previousUsername);
    restoreEnvironment("BASIC_AUTH_PASSWORD_HASH", previousPasswordHash);
  }
});

import { assert, assertEquals } from "@std/assert";
import { relative } from "@std/path";
import { ulid } from "@std/ulid";
import { App, csrf } from "fresh";
import type { AppState } from "../types/app.ts";

const AUTHORIZATION = `Basic ${btoa("test:test")}`;
const ORIGIN = "http://localhost";

async function pathExists(path: string): Promise<boolean> {
  try {
    await Deno.lstat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
}

function createIssue(id: string) {
  const timestamp = new Date().toISOString();

  return {
    id,
    communityId: "community",
    categoryId: "category",
    typeId: "type",
    status: "open" as const,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createDeleteRequest(
  routeId: string,
  bodyId: string,
  origin = ORIGIN,
  secFetchSite = "same-origin",
): Request {
  return new Request(`${ORIGIN}/issues/${routeId}/delete`, {
    method: "POST",
    headers: {
      "Authorization": AUTHORIZATION,
      "Origin": origin,
      "Sec-Fetch-Site": secFetchSite,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ id: bodyId, lang: "en" }),
  });
}

Deno.test("issue deletion is confined to recorded issue directories", async (t) => {
  const testRoot = await Deno.makeTempDir({ prefix: "lokalac-delete-test-" });
  const uploadDirectory = `${testRoot}/upload`;
  const previousKvStorageDirectory = Deno.env.get("KV_STORAGE_DIR");
  const previousUploadDirectory = Deno.env.get("UPLOAD_DIR");
  let testKv: Deno.Kv | undefined;

  Deno.env.set(
    "KV_STORAGE_DIR",
    relative(Deno.cwd(), `${testRoot}/data`),
  );
  Deno.env.set("UPLOAD_DIR", uploadDirectory);
  await Deno.mkdir(uploadDirectory, { recursive: true });

  try {
    const [{ handler }, issueModel, kvService] = await Promise.all([
      import("../routes/issues/[issue]/delete.tsx"),
      import("../models/issue.ts"),
      import("../services/kv.ts"),
    ]);
    const { deleteIssue, IssueIndex } = issueModel;
    const { kv } = kvService;
    testKv = kv;

    const postHandler = handler.POST;
    const route = new App<AppState>()
      .use(csrf())
      .post("/issues/:issue/delete", async (ctx) => {
        const response = await postHandler(ctx);

        if (!(response instanceof Response)) {
          throw new Error("Delete handler did not return a Response");
        }

        return response;
      })
      .handler();

    const seedIssue = async (id: string) => {
      await kv.set([IssueIndex, id], createIssue(id));
      await Deno.mkdir(`${uploadDirectory}/${id}`);
      await Deno.writeTextFile(`${uploadDirectory}/${id}/image.webp`, "image");
    };

    await t.step("uses the route ID instead of the body ID", async () => {
      const routeId = ulid();
      const bodyId = ulid();
      await seedIssue(routeId);
      await seedIssue(bodyId);

      const response = await route(createDeleteRequest(routeId, bodyId));

      assertEquals(response.status, 303);
      assertEquals((await kv.get([IssueIndex, routeId])).value, null);
      assertEquals(await pathExists(`${uploadDirectory}/${routeId}`), false);
      assert((await kv.get([IssueIndex, bodyId])).value !== null);
      assertEquals(await pathExists(`${uploadDirectory}/${bodyId}`), true);
    });

    await t.step("ignores unsafe body IDs", async () => {
      const outsideFile = `${testRoot}/outside.txt`;
      await Deno.writeTextFile(outsideFile, "keep");
      const unsafeBodyIds = [
        "..",
        "../outside",
        `${testRoot}/outside`,
        String.raw`C:\outside`,
        "%2Foutside",
        "%5Coutside",
      ];

      for (const bodyId of unsafeBodyIds) {
        const routeId = ulid();
        await seedIssue(routeId);

        const response = await route(createDeleteRequest(routeId, bodyId));

        assertEquals(response.status, 303, bodyId);
        assertEquals((await kv.get([IssueIndex, routeId])).value, null);
        assertEquals(await pathExists(outsideFile), true);
      }
    });

    await t.step("rejects unsafe route IDs before deletion", async () => {
      const outsideFile = `${testRoot}/route-outside.txt`;
      await Deno.writeTextFile(outsideFile, "keep");
      const unsafeIds = [
        "..",
        "../outside",
        `${testRoot}/outside`,
        String.raw`C:\outside`,
        "%2Foutside",
        "%5Coutside",
        "01J0000000000/0000000000000",
        String.raw`01J0000000000\0000000000000`,
      ];

      for (const id of unsafeIds) {
        assertEquals(await deleteIssue(id), { status: "invalid_id" }, id);
        assertEquals(await pathExists(outsideFile), true);
      }
    });

    await t.step("rejects encoded traversal and route separators", async () => {
      const outsideFile = `${testRoot}/encoded-route-outside.txt`;
      await Deno.writeTextFile(outsideFile, "keep");
      const unsafeRouteIds = [
        "..%2Foutside",
        "%2Ftmp%2Foutside",
        "01J0000000000%2F0000000000000",
        "01J0000000000%5C0000000000000",
      ];

      for (const routeId of unsafeRouteIds) {
        const response = await route(createDeleteRequest(routeId, ulid()));

        assertEquals(response.status, 404, routeId);
        assertEquals(await pathExists(outsideFile), true);
      }
    });

    await t.step("preserves an unrecorded ULID directory", async () => {
      const id = ulid();
      const directory = `${uploadDirectory}/${id}`;
      await Deno.mkdir(directory);
      await Deno.writeTextFile(`${directory}/image.webp`, "image");

      assertEquals(await deleteIssue(id), { status: "not_found" });
      assertEquals(await pathExists(directory), true);
    });

    await t.step("deletes a recorded issue directory", async () => {
      const id = ulid();
      await seedIssue(id);

      assertEquals(await deleteIssue(id), { status: "deleted" });
      assertEquals((await kv.get([IssueIndex, id])).value, null);
      assertEquals(await pathExists(`${uploadDirectory}/${id}`), false);
    });

    await t.step("rejects a cross-origin deletion", async () => {
      const id = ulid();
      await seedIssue(id);

      const response = await route(
        createDeleteRequest(id, id, "https://attacker.example", "cross-site"),
      );

      assertEquals(response.status, 403);
      assert((await kv.get([IssueIndex, id])).value !== null);
      assertEquals(await pathExists(`${uploadDirectory}/${id}`), true);
    });
  } finally {
    testKv?.close();

    if (previousKvStorageDirectory === undefined) {
      Deno.env.delete("KV_STORAGE_DIR");
    } else {
      Deno.env.set("KV_STORAGE_DIR", previousKvStorageDirectory);
    }

    if (previousUploadDirectory === undefined) {
      Deno.env.delete("UPLOAD_DIR");
    } else {
      Deno.env.set("UPLOAD_DIR", previousUploadDirectory);
    }

    await Deno.remove(testRoot, { recursive: true });
  }
});

import { assertEquals, assertRejects } from "@std/assert";
import {
  readLimitedFormData,
  RequestBodyTooLargeError,
} from "./requestBody.ts";

Deno.test("limited form-data parsing", async (t) => {
  await t.step(
    "parses the complete multipart body regardless of field order",
    async () => {
      const body = new FormData();
      body.append(
        "images[]",
        new File(["image"], "issue.webp", {
          type: "image/webp",
        }),
      );
      body.append("note", "Broken pavement");
      body.append("issue_type", "pothole");
      body.append("location", JSON.stringify({ lat: 46.1, lng: 19.6 }));
      body.append("issue_category", "roads");
      body.append("local_community", "center");

      const request = new Request("http://localhost/issues/submit", {
        method: "POST",
        body,
      });

      const formData = await readLimitedFormData(request, 1_024);
      const image = formData.get("images[]");

      assertEquals(formData.get("local_community"), "center");
      assertEquals(formData.get("issue_category"), "roads");
      assertEquals(formData.get("issue_type"), "pothole");
      assertEquals(formData.get("note"), "Broken pavement");
      assertEquals(formData.get("location"), '{"lat":46.1,"lng":19.6}');
      assertEquals(image instanceof File, true);
      assertEquals((image as File).name, "issue.webp");
      assertEquals(await (image as File).text(), "image");
    },
  );

  await t.step("parses a body at the byte limit", async () => {
    const request = new Request("http://localhost/issues/submit", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "a=b",
    });

    const formData = await readLimitedFormData(request, 3);

    assertEquals(formData.get("a"), "b");
  });

  await t.step("rejects a declared oversized body before reading", async () => {
    const request = new Request("http://localhost/issues/submit", {
      method: "POST",
      headers: {
        "Content-Length": "100",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "a=b",
    });

    await assertRejects(
      () => readLimitedFormData(request, 10),
      RequestBodyTooLargeError,
    );
    assertEquals(request.bodyUsed, false);
  });

  await t.step("rejects an oversized streamed body", async () => {
    const request = new Request("http://localhost/issues/submit", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "field=value",
    });

    await assertRejects(
      () => readLimitedFormData(request, 5),
      RequestBodyTooLargeError,
    );
  });
});

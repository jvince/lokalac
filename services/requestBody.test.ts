import { assertEquals, assertRejects } from "@std/assert";
import {
  readLimitedFormData,
  RequestBodyTooLargeError,
} from "./requestBody.ts";

Deno.test("limited form-data parsing", async (t) => {
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

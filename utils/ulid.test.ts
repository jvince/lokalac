import { assertEquals } from "@std/assert";
import { isValidUlid } from "./ulid.ts";

Deno.test("isValidUlid accepts canonical ULIDs", () => {
  assertEquals(isValidUlid("01J00000000000000000000000"), true);
  assertEquals(isValidUlid("7ZZZZZZZZZZZZZZZZZZZZZZZZZ"), true);
});

Deno.test("isValidUlid rejects unsafe and malformed values", () => {
  const invalidValues = [
    null,
    undefined,
    "",
    "..",
    "../data",
    "/tmp/data",
    String.raw`C:\data`,
    "01J0000000000/0000000000000",
    String.raw`01J0000000000\0000000000000`,
    "01J0000000000%2F0000000000000",
    "01J0000000000%5C0000000000000",
    "81J00000000000000000000000",
    "01j00000000000000000000000",
  ];

  for (const value of invalidValues) {
    assertEquals(isValidUlid(value), false, String(value));
  }
});

import { assertEquals, assertRejects } from "@std/assert";
import { createSemaphore, SemaphoreTimeoutError } from "./semaphore.ts";

Deno.test("semaphore limits concurrent operations", async () => {
  const semaphore = createSemaphore(2);
  let active = 0;
  let maximumActive = 0;
  const releases: Array<() => void> = [];

  const operations = Array.from(
    { length: 4 },
    (_, index) =>
      semaphore.run(async () => {
        active += 1;
        maximumActive = Math.max(maximumActive, active);

        await new Promise<void>((resolve) => releases[index] = resolve);
        active -= 1;
      }),
  );

  await new Promise((resolve) => setTimeout(resolve, 0));
  assertEquals(active, 2);

  releases[0]();
  releases[1]();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assertEquals(active, 2);

  releases[2]();
  releases[3]();
  await Promise.all(operations);

  assertEquals(maximumActive, 2);
  assertEquals(active, 0);
});

Deno.test("semaphore limits queue wait time", async () => {
  const semaphore = createSemaphore(1);
  let release: () => void = () => {};
  const active = semaphore.run(() =>
    new Promise<void>((resolve) => release = resolve)
  );

  await new Promise((resolve) => setTimeout(resolve, 0));
  await assertRejects(
    () => semaphore.run(() => Promise.resolve(), 1),
    SemaphoreTimeoutError,
  );

  release();
  await active;
});

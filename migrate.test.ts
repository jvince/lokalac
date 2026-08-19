import { assertEquals, assertRejects } from "@std/assert";
import { migrate, type Migration, MigrationError } from "@/migrate.ts";

async function withKv(
  run: (kv: Deno.Kv) => Promise<void>,
) {
  const directory = await Deno.makeTempDir();
  const kv = await Deno.openKv(`${directory}/kv.sqlite`);
  try {
    await run(kv);
  } finally {
    kv.close();
    await Deno.remove(directory, { recursive: true });
  }
}

function setValueMigration(
  version: string,
  calls: { value: number },
): Migration {
  return [version, () => {
    calls.value++;
    return { type: "set", key: ["data", version], value: version };
  }];
}

Deno.test("migration commits mutations and completion state together", async () => {
  await withKv(async (kv) => {
    const calls = { value: 0 };
    await migrate([setValueMigration("one", calls)], kv);

    assertEquals((await kv.get(["data", "one"])).value, "one");
    assertEquals((await kv.get(["migration", "one"])).value, {
      version: "one",
      done: true,
    });
    assertEquals(calls.value, 1);
  });
});

Deno.test("completed migrations are idempotent", async () => {
  await withKv(async (kv) => {
    const calls = { value: 0 };
    const migration = setValueMigration("repeat", calls);

    await migrate([migration], kv);
    await migrate([migration], kv);

    assertEquals(calls.value, 1);
  });
});

Deno.test("failed and interrupted migrations leave no partial state and can retry", async () => {
  await withKv(async (kv) => {
    let shouldFail = true;
    const migration: Migration = ["retry", () => {
      if (shouldFail) throw new Error("interrupted");
      return { type: "set", key: ["data", "retry"], value: "done" };
    }];

    const error = await assertRejects(
      () => migrate([migration], kv),
      MigrationError,
    );
    assertEquals(error.version, "retry");
    assertEquals(error.stage, "handler");
    assertEquals((await kv.get(["data", "retry"])).value, null);
    assertEquals((await kv.get(["migration", "retry"])).value, null);

    shouldFail = false;
    await migrate([migration], kv);
    assertEquals((await kv.get(["data", "retry"])).value, "done");
  });
});

Deno.test("concurrent migration runners safely converge", async () => {
  await withKv(async (kv) => {
    const calls = { value: 0 };
    const migration = setValueMigration("concurrent", calls);

    await Promise.all([
      migrate([migration], kv),
      migrate([migration], kv),
      migrate([migration], kv),
    ]);

    assertEquals((await kv.get(["data", "concurrent"])).value, "concurrent");
    assertEquals((await kv.get(["migration", "concurrent"])).value, {
      version: "concurrent",
      done: true,
    });
  });
});

Deno.test("atomic commit failures propagate as typed errors without partial state", async () => {
  await withKv(async (kv) => {
    const migration: Migration = [
      "too-large",
      () =>
        Array.from({ length: 1_001 }, (_, index) => ({
          type: "set" as const,
          key: ["large", index],
          value: index,
        })),
    ];

    const error = await assertRejects(
      () => migrate([migration], kv),
      MigrationError,
    );
    assertEquals(error.version, "too-large");
    assertEquals(error.stage, "commit");
    assertEquals((await kv.get(["large", 0])).value, null);
    assertEquals((await kv.get(["migration", "too-large"])).value, null);
  });
});

export interface MigrationHandler {
  (
    kv: Deno.Kv,
  ):
    | Promise<Deno.KvMutation | Deno.KvMutation[]>
    | Deno.KvMutation
    | Deno.KvMutation[];
}

export interface MigrationValue {
  version: string;
  done: boolean;
}

export type Migration = [string, MigrationHandler];

function needsMigration(migrations: MigrationValue[], version: string) {
  return !migrations.some((item) => item.version === version && item.done);
}

export async function migrate(migrations: Migration[], kv: Deno.Kv) {
  const migrationsResult =
    (await Array.fromAsync(kv.list<MigrationValue>({ prefix: ["migration"] })))
      .map((item) => item.value);

  for (const [version, handler] of migrations) {
    if (needsMigration(migrationsResult, version)) {
      const transaction = kv.atomic();

      try {
        console.log(`Running migration ${version}.`);
        await kv.set(["migration", version], { version, done: false });
        const handlerResult = await handler(kv);

        transaction.mutate(
          ...(Array.isArray(handlerResult) ? handlerResult : [handlerResult]),
        );
        await transaction.commit();
        await kv.set(["migration", version], { version, done: true });
      } catch (error) {
        console.error(`Migration ${version} failed. Error: ${error}`);
        kv.close();
        Deno.exit(1);
      }
    }
  }
}

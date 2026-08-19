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

export type MigrationFailureStage = "handler" | "commit";

export class MigrationError extends Error {
  constructor(
    public readonly version: string,
    public readonly stage: MigrationFailureStage,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "MigrationError";
  }
}

export async function migrate(migrations: Migration[], kv: Deno.Kv) {
  for (const [version, handler] of migrations) {
    const migrationKey: Deno.KvKey = ["migration", version];
    const state = await kv.get<MigrationValue>(migrationKey);

    if (state.value?.done) {
      continue;
    }

    console.log(`Running migration ${version}.`);

    let handlerResult: Deno.KvMutation | Deno.KvMutation[];
    try {
      handlerResult = await handler(kv);
    } catch (error) {
      throw new MigrationError(
        version,
        "handler",
        `Migration ${version} failed while preparing mutations.`,
        { cause: error },
      );
    }

    const mutations = Array.isArray(handlerResult)
      ? handlerResult
      : [handlerResult];
    let expectedState = state;

    // A failed check means another process changed this migration marker. If it
    // completed the migration, our identical mutations do not need to run.
    while (true) {
      let result: Deno.KvCommitResult | Deno.KvCommitError;
      try {
        result = await kv.atomic()
          .check(expectedState)
          .mutate(...mutations)
          .set(migrationKey, { version, done: true } satisfies MigrationValue)
          .commit();
      } catch (error) {
        throw new MigrationError(
          version,
          "commit",
          `Migration ${version} failed while committing mutations.`,
          { cause: error },
        );
      }

      if (result.ok) {
        break;
      }

      expectedState = await kv.get<MigrationValue>(migrationKey);
      if (expectedState.value?.done) {
        break;
      }
    }
  }
}

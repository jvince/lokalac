import { assertEquals } from "@std/assert";
import { hash, Variant } from "@felix/argon2";

const username = "administrator";
const originalUsername = Deno.env.get("BASIC_AUTH_USERNAME");
const originalPasswordHash = Deno.env.get("BASIC_AUTH_PASSWORD_HASH");

// Configuration is validated while the modules are imported, so provide
// explicit test values instead of depending on a local .env file.
Deno.env.set("BASIC_AUTH_USERNAME", username);
Deno.env.set("BASIC_AUTH_PASSWORD_HASH", "test-placeholder");

const [{ basicAuth }, { appConfig }] = await Promise.all([
  import("./basicAuth.ts"),
  import("../config.ts"),
]);

function requestWithCredentials(user: string, password: string): Request {
  return new Request("https://example.test/admin", {
    headers: {
      Authorization: `Basic ${btoa(`${user}:${password}`)}`,
    },
  });
}

function requestWithAuthorization(authorization?: string): Request {
  return new Request("https://example.test/admin", {
    headers: authorization === undefined
      ? {}
      : { Authorization: authorization },
  });
}

async function assertUnauthorized(request: Request): Promise<void> {
  const response = await basicAuth(request);

  assertEquals(response?.status, 401);
  assertEquals(
    response?.headers.get("WWW-Authenticate"),
    'Basic realm="Restricted Area"',
  );
}

Deno.test("basic authentication", async (t) => {
  const currentPassword = "current:password";
  const rotatedPassword = "rotated password";
  const currentHash = await hash(currentPassword, {
    variant: Variant.Argon2id,
  });
  const rotatedHash = await hash(rotatedPassword, {
    variant: Variant.Argon2id,
  });

  appConfig.basicAuthUsername = username;
  appConfig.basicAuthPasswordHash = currentHash;

  try {
    await t.step("accepts valid credentials", async () => {
      assertEquals(
        await basicAuth(requestWithCredentials(username, currentPassword)),
        undefined,
      );
    });

    await t.step("rejects invalid credentials", async () => {
      await assertUnauthorized(
        requestWithCredentials("not-the-administrator", currentPassword),
      );
      await assertUnauthorized(
        requestWithCredentials(username, "incorrect-password"),
      );
    });

    await t.step("rejects missing and malformed authorization", async () => {
      const malformedHeaders = [
        undefined,
        "Bearer token",
        "Basic !!!",
        `Basic ${btoa(username)}`,
        "Basic ",
      ];

      for (const authorization of malformedHeaders) {
        await assertUnauthorized(requestWithAuthorization(authorization));
      }
    });

    await t.step("uses a rotated password hash immediately", async () => {
      appConfig.basicAuthPasswordHash = rotatedHash;

      await assertUnauthorized(
        requestWithCredentials(username, currentPassword),
      );
      assertEquals(
        await basicAuth(requestWithCredentials(username, rotatedPassword)),
        undefined,
      );
    });
  } finally {
    appConfig.basicAuthUsername = originalUsername;
    appConfig.basicAuthPasswordHash = originalPasswordHash;

    if (originalUsername === undefined) {
      Deno.env.delete("BASIC_AUTH_USERNAME");
    } else {
      Deno.env.set("BASIC_AUTH_USERNAME", originalUsername);
    }

    if (originalPasswordHash === undefined) {
      Deno.env.delete("BASIC_AUTH_PASSWORD_HASH");
    } else {
      Deno.env.set("BASIC_AUTH_PASSWORD_HASH", originalPasswordHash);
    }
  }
});

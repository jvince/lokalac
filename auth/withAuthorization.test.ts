import { appConfig } from "@/config.ts";
import { createRateLimiter } from "@/services/rateLimiter.ts";
import { assertEquals } from "@std/assert";
import { hash, Variant } from "@felix/argon2";
import { App } from "fresh";
import { withAuthorization } from "./withAuthorization.ts";

function requestWithCredentials(username: string, password: string): Request {
  return new Request("http://localhost/", {
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    },
  });
}

Deno.test("authorization rate limiting", async (t) => {
  const username = "administrator";
  const password = "correct password";
  const originalUsername = appConfig.basicAuthUsername;
  const originalPasswordHash = appConfig.basicAuthPasswordHash;

  appConfig.basicAuthUsername = username;
  appConfig.basicAuthPasswordHash = await hash(password, {
    variant: Variant.Argon2id,
  });

  try {
    await t.step(
      "allows valid credentials without recording a failure",
      async () => {
        const limiter = createRateLimiter({ maxRequests: 1 });
        let handlerCalls = 0;
        const protectedHandler = withAuthorization(limiter)(() => {
          handlerCalls += 1;
          return new Response("ok");
        });
        const route = new App()
          .get("/", async (ctx) => {
            const response = await protectedHandler(ctx);

            if (!(response instanceof Response)) {
              throw new Error("Protected handler did not return a Response.");
            }

            return response;
          })
          .handler();

        assertEquals(
          (await route(requestWithCredentials(username, password))).status,
          200,
        );
        assertEquals(handlerCalls, 1);
      },
    );

    await t.step("returns 401 for failures and 429 once blocked", async () => {
      const limiter = createRateLimiter({ maxRequests: 2 });
      let handlerCalls = 0;
      const protectedHandler = withAuthorization(limiter)(() => {
        handlerCalls += 1;
        return new Response("ok");
      });
      const route = new App()
        .get("/", async (ctx) => {
          const response = await protectedHandler(ctx);

          if (!(response instanceof Response)) {
            throw new Error("Protected handler did not return a Response.");
          }

          return response;
        })
        .handler();

      for (const expectedStatus of [401, 401, 429]) {
        const response = await route(
          requestWithCredentials(username, "wrong password"),
        );
        assertEquals(response.status, expectedStatus);
      }

      assertEquals(handlerCalls, 0);
    });
  } finally {
    appConfig.basicAuthUsername = originalUsername;
    appConfig.basicAuthPasswordHash = originalPasswordHash;
  }
});

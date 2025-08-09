import { Handler } from "$fresh/server.ts";
import { basicAuth } from "./basicAuth.ts";

export const WithAuthorization =
  <T, S>(handler: Handler<T, S>): Handler<T, S> => async (req, ctx) => {
    const unauthorized = basicAuth(req);

    if (unauthorized) {
      return unauthorized;
    }

    return await handler(req, ctx);
  };

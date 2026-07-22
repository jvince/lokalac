import { HandlerFn } from "fresh";
import { basicAuth } from "./basicAuth.ts";

export const WithAuthorization =
  <T, S>(handler: HandlerFn<T, S>): HandlerFn<T, S> => async (ctx) => {
    const unauthorized = basicAuth(ctx.req);

    if (unauthorized) {
      return unauthorized;
    }

    return await handler(ctx);
  };

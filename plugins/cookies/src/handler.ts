import type { FreshContext } from "$fresh/server.ts";
import { deleteCookie, getCookies, setCookie } from "$std/http/cookie.ts";
import type { CookiesState, DeleteCookie, SetCookie } from "./types.ts";

function _setCookie(headers: Headers): SetCookie {
  return (cookie) => {
    setCookie(headers, cookie);
  };
}

function _deleteCookie(headers: Headers): DeleteCookie {
  return (name, attributes) => {
    deleteCookie(headers, name, attributes);
  };
}

export function createHandler() {
  return async (req: Request, ctx: FreshContext<CookiesState>) => {
    if (ctx.destination !== "route" && ctx.destination !== "notFound") {
      return await ctx.next();
    }
    
    const headers = new Headers();
    ctx.state.cookies = getCookies(req.headers);
    ctx.state.setCookie = _setCookie(headers);
    ctx.state.deleteCookie = _deleteCookie(headers);

    const res = await ctx.next();

    headers.forEach((value, key) => {
      res.headers.append(key, value);
    });

    return res;
  };
}

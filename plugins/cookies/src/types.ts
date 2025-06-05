import type { Cookie, deleteCookie } from "$std/http/cookie.ts";

type CookieAttributes = Parameters<typeof deleteCookie>[2];

export interface SetCookie {
  (cookie: Cookie): void;
}

export interface DeleteCookie {
  (name: string, attributes?: CookieAttributes): void;
}

export interface CookiesState {
  cookies: Record<string, string>;
  setCookie: SetCookie;
  deleteCookie: DeleteCookie;
}

import type { FreshContext } from "$fresh/server.ts";
import type { CookiesState } from "$plugins/cookies/mod.ts";
import { i18nState } from "$plugins/i18n/mod.ts";

export interface AppState extends CookiesState, i18nState {}

export interface AppContext<
  State = AppState,
  // deno-lint-ignore no-explicit-any
  Data = any,
  NotFound = Data,
> extends FreshContext<State, Data, NotFound> {}

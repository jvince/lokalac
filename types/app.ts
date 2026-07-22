import { i18nLanguage, i18nState } from "@/plugins/i18n/mod.ts";
import { createDefine } from "fresh";

export interface AppState extends i18nState {}

export interface GlobalContext {
  language: i18nLanguage;
  translation: Record<string, Record<string, string>>;
  baseURL: string;
  path: string;
}

export const define = createDefine<AppState>();

import {
  i18nLanguage,
  i18nState,
  i18nTranslation,
} from "@/plugins/i18n/mod.ts";
import { createDefine } from "fresh";

export interface AppState extends i18nState {}

export interface GlobalContext {
  language: i18nLanguage;
  translation: i18nTranslation;
  baseURL: string;
  path: string;
}

export const define = createDefine<AppState>();

export interface i18nLanguage {
  code: string;
  localizedName: string;
  package: string;
}

export interface i18nPluginConfig<
  T extends readonly i18nLanguage[] = readonly i18nLanguage[],
> {
  languages: T;
  defaultLanguage: T[number]["code"];
  languagesDir: string;
}

export type i18nTranslation = Record<string, Record<string, string>>;
export interface i18nState {
  translation: i18nTranslation;
  language: i18nLanguage;
}

export interface WithI18nState {
  i18nState: i18nState;
}

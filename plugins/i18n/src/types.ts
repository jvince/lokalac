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

export type i18nTranslationValue =
  | string
  | number
  | { [key: string]: i18nTranslationValue };

export type i18nTranslationPackage = Record<
  string,
  i18nTranslationValue
>;

export type i18nTranslation = Record<string, i18nTranslationPackage>;
export interface i18nState {
  translation: i18nTranslation;
  language: i18nLanguage;
}

export interface WithI18nState {
  i18nState: i18nState;
}

export interface i18nPluginConfig {
  languages: string[];
  defaultLanguage: string;
  languagesDir: string;
}

export interface i18nState {
  translationData: Record<string, Record<string, string>>;
  language: string;
}

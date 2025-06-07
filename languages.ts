const languages = [
  {
    code: "sr-Latn-RS",
    localizedName: "Srpski (latinica)",
    package: "sr-Latn-RS",
  },
  {
    code: "sr-Cyrl-RS",
    localizedName: "Српски (ћирилица)",
    package: "sr-Cyrl-RS",
  },
  {
    code: "hu",
    localizedName: "Magyar",
    package: "hu",
  },
] as const;

export const defaultLanguage = languages[0];

export default languages;

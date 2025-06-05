function getPreferredLanguage(
  acceptLanguage: string,
  defaultLanguage: string,
  langugages: string[],
): string {
  if (!acceptLanguage) {
    return defaultLanguage;
  }

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");

      return {
        code: code.toLowerCase(),
        qValue: qValue ? parseFloat(qValue) : 1.0,
      };
    }).sort((a, b) => b.qValue - a.qValue);

  for (const lang of languages) {
    const code = lang.code.split("-")[0];
    if (langugages.includes(code)) {
      return code;
    }
  }

  return defaultLanguage;
}

export { getPreferredLanguage as getPreferredLocale };

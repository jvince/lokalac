import { defaultLanguage } from "@/languages.ts";

export function isRelativeUrl(url: string): boolean {
  return url.startsWith("/");
}

export function createInternalUrl(
  url: string | undefined,
): URL | string | undefined {
  if (typeof url === "string" && isRelativeUrl(url)) {
    return new URL(`internal://domain${url}`);
  }

  return url;
}

export function createLanguageUrl(
  url: URL | string | undefined,
  languageCode: string = defaultLanguage.code,
): URL | string | undefined {
  if (!url || typeof url === "string") {
    return url;
  }

  const newUrl = new URL(url);
  if (
    !newUrl.searchParams.has("lang") && languageCode !== defaultLanguage.code
  ) {
    newUrl.searchParams.set("lang", languageCode);
  }
  return newUrl;
}

export function toRelativeUrl(
  url: URL | string | undefined,
): string | undefined {
  if (!url || typeof url === "string") {
    return url;
  }

  if (url.protocol === "internal:") {
    return `${url.pathname}${url.search}${url.hash}`;
  }
}

/**
 * Converts a URL to a normalized format, ensuring it includes the language code
 * if necessary. If the URL is relative, it will be converted to an internal URL.
 * If the language code is not the default, it will be added as a search parameter.
 */
export function toNormalizedUrl(
  url: string | undefined,
  languageCode: string = defaultLanguage.code,
) {
  return toRelativeUrl(
    createLanguageUrl(createInternalUrl(url), languageCode),
  );
}

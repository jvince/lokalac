import { defaultLanguage } from "../languages.ts";

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

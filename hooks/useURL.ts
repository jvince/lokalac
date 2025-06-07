export function useURL(href: string | undefined, lang: string, baseURL: URL) {
  if (!href) {
    return {
      valid: false,
    };
  }

  try {
    const url = new URL(href, baseURL);
    const external = url.origin !== baseURL.origin;
    if (!external && !href.startsWith("/")) {
      return { valid: false };
    }

    if (!external) {
      url.searchParams.set("lang", lang);
    }

    return {
      external,
      valid: true,
      url: url.toString(),
    };
  } catch {
    return {
      valid: false,
    };
  }
}

import { useGlobalContext } from "../globalContext.ts";
import { defaultLanguage } from "../languages.ts";

export function useURL(href: string) {
  const { baseURL, language } = useGlobalContext();

  try {
    const url = new URL(href, baseURL);
    const external = url.origin !== baseURL;

    if (!external) {
      if (language.code !== defaultLanguage.code) {
        url.searchParams.set("lang", language.code);
      }
    }

    return {
      external,
      url: url.toString(),
    };
  } catch {
    return { external: false, url: href };
  }
}

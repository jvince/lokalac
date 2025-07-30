import { useGlobalContext } from "../globalContext.ts";
import { defaultLanguage } from "../languages.ts";

export function useURL(href: string) {
  const { baseURL, language, path } = useGlobalContext();
  console.log(path);

  try {
    const url = new URL(href, baseURL);
    const external = url.origin !== baseURL;

    if (!external) {
      if (language.code !== defaultLanguage.code) {
        url.searchParams.set("lang", language.code);
      }
    }

    return {
      active: url.pathname === path,
      external,
      url: url.toString(),
    };
  } catch {
    return {
      active: false,
      external: false,
      url: "/404",
    };
  }
}

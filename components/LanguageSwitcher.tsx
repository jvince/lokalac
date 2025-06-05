import { useGlobalContext } from "../globalContext.ts";

export function LanguageSwitcher() {
  const { lang } = useGlobalContext();

  return (
    <form method="GET">
      <select name="lang" className="select">
        <option value="rs" selected={lang === "rs"}>Srpski</option>
        <option value="hu" selected={lang === "hu"}>Magyar</option>
      </select>

      <button className="btn btn-primary ml-2" type="submit">
        Change Language
      </button>
    </form>
  );
}

import type { Handlers, PageProps } from "$fresh/server.ts";
import { Form } from "../components/Form.tsx";

const NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Eve",
  "Frank",
  "Grace",
  "Heidi",
  "Ivan",
  "Judy",
];

interface Data {
  results: string[];
  query: string;
}

export const handler: Handlers<Data> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    const results = NAMES.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase())
    );

    return ctx.render({ results, query });
  },
};

export default function SearchPage({ data, url }: PageProps<Data>) {
  const { query, results } = data;

  return (
    <div>
      <Form class="flex gap-4">
        <input
          class="input"
          type="text"
          name="q"
          value={query}
          placeholder="Search..."
        />
        <button class="btn" type="submit">Search</button>
      </Form>

      <ul class="list bg-base-100 rounded-box shadow-md mt-4">
        {results.map((name) => <li key={name} class="list-row">{name}</li>)}
      </ul>
    </div>
  );
}

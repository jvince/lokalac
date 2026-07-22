import { getLocalCommunityPolygonById } from "@/models/local-community.ts";
import { define } from "@/types/app.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const polygon = (await getLocalCommunityPolygonById(ctx.params.id)) ?? [];
    return new Response(JSON.stringify(polygon));
  },
});

import { Handlers } from "$fresh/server.ts";
import { getLocalCommunityPolygonById } from "$models/local-community.ts";

export const handler: Handlers = {
  async GET(_, ctx) {
    const polygon = (await getLocalCommunityPolygonById(ctx.params.id)) ?? [];
    return new Response(JSON.stringify(polygon));
  },
};

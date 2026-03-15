export const prerender = false;

import type { APIRoute } from "astro";

type DiscogsSearchRequest = {
  albumName: string;
  page?: number;
  perPage?: number;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { albumName, page = 1, perPage = 20 }: DiscogsSearchRequest = await request.json();

    if (!albumName) {
      return new Response(JSON.stringify({ error: "Album name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch(
      `https://api.discogs.com/database/search?q=${encodeURIComponent(
        albumName
      )}&type=master&sort=date_added&sort_order=desc&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Discogs token=${import.meta.env.DISCOGS_TOKEN}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        results: data.results,
        pagination: {
          page: data.pagination.page,
          perPage: data.pagination.per_page,
          totalPages: data.pagination.pages,
          totalItems: data.pagination.items,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Discogs API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

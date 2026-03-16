export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { albumName, page: reqPage = 1, perPage: reqPerPage = 20 } = await request.json();

    if (!albumName) {
      return new Response(JSON.stringify({ error: "Album name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(
        albumName
      )}&api_key=${
        import.meta.env.LASTFM_API_KEY
      }&format=json&page=${reqPage}&limit=${reqPerPage}`,
      {
        headers: {
          "Content-Type": "application/json",
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

    const albums = data?.results?.albummatches?.album ?? [];
    const startIndex = parseInt(data.results["opensearch:startIndex"]) || 0;
    const itemsPerPage = parseInt(data.results["opensearch:itemsPerPage"]) || 20;
    const totalResults = parseInt(data.results["opensearch:totalResults"]) || 0;
    
    const page = Math.floor(startIndex / itemsPerPage) + 1;
    const perPage = itemsPerPage;
    const totalPages = itemsPerPage > 0 ? Math.ceil(totalResults / itemsPerPage) : 0;
    const totalItems = totalResults;

    return new Response(
      JSON.stringify({
        results: albums,
        pagination: {
          page,
          perPage,
          totalPages,
          totalItems,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Last.fm API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

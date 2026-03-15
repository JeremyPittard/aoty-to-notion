export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { albumName, page = 1, perPage = 20 } = await request.json();

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
      }&format=json&page=${page}&limit=${perPage}`,
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

    return new Response(
      JSON.stringify({
        results: data.results.albummatches.album,
        pagination: {
          page:
            parseInt(data.results["opensearch:startIndex"]) /
              parseInt(data.results["opensearch:itemsPerPage"]) +
            1,
          perPage: parseInt(data.results["opensearch:itemsPerPage"]),
          totalPages: Math.ceil(
            parseInt(data.results["opensearch:totalResults"]) /
              parseInt(data.results["opensearch:itemsPerPage"])
          ),
          totalItems: parseInt(data.results["opensearch:totalResults"]),
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

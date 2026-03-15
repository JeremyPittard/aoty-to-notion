export const prerender = false;

import type { APIRoute } from "astro";
import { normalizeResults } from "../../services/album-normalizer";

export const POST: APIRoute = async ({ request }) => {
  console.log("Search API received request");

  try {
    const body = await request.json();
    console.log("Request body:", body);

    const {
      albumName,
      sources = ["lastfm"], // Default to Last.fm only since Discogs is failing
      page = 1,
      perPage = 20,
    } = body;

    if (!albumName) {
      console.error("No album name provided");
      return new Response(JSON.stringify({ error: "Album name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const promises: Promise<any>[] = [];

    if (sources.includes("discogs")) {
      promises.push(
        fetch(
          `https://api.discogs.com/database/search?q=${encodeURIComponent(
            albumName,
          )}&type=master&sort=date_added&sort_order=desc&page=${page}&per_page=${perPage}`,
          {
            method: "GET",
            headers: {
              Authorization: `Discogs token=${import.meta.env.DISCOGS_TOKEN}`,
              "Content-Type": "application/json",
            },
          },
        )
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            console.error("Discogs API returned status:", res.status);
            return { results: [] };
          })
          .catch((err) => {
            console.error("Discogs API error:", err);
            return { results: [] };
          }),
      );
    }

    if (sources.includes("lastfm")) {
      promises.push(
        fetch(
          `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(
            albumName,
          )}&api_key=${
            import.meta.env.LASTFM_API_KEY
          }&format=json&page=${page}&limit=${perPage}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        ).then(async (res) => {
          const searchData = await res.json();

          // Fetch additional album info for each result to get year and genre
          if (searchData.results?.albummatches?.album) {
            const albumPromises = searchData.results.albummatches.album.map(
              async (album: any) => {
                if (album.mbid) {
                  try {
                    const infoResponse = await fetch(
                      `https://ws.audioscrobbler.com/2.0/?method=album.getInfo&mbid=${
                        album.mbid
                      }&api_key=${import.meta.env.LASTFM_API_KEY}&format=json`,
                    );
                    const infoData = await infoResponse.json();
                    if (infoData.album) {
                      return { ...album, ...infoData.album };
                    }
                  } catch (error) {
                    console.error(
                      `Error fetching album info for MBID ${album.mbid}:`,
                      error,
                    );
                  }
                }
                return album;
              },
            );

            searchData.results.albummatches.album = await Promise.all(
              albumPromises,
            );
          }

          return searchData;
        }),
      );
    }

    const results = await Promise.allSettled(promises);

    let discogsResults: any[] = [];
    let lastfmResults: any[] = [];
    let pagination: any;

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        console.log("Single API response:", data);

        // Parse Discogs results
        if (data.results && Array.isArray(data.results)) {
          discogsResults = data.results;
          pagination = data.pagination;
        }

        // Parse Last.fm results
        if (
          data.results?.albummatches?.album &&
          Array.isArray(data.results.albummatches.album)
        ) {
          lastfmResults = data.results.albummatches.album;
          pagination = {
            page: (() => {
              const startIndex =
                parseInt(data.results["opensearch:startIndex"]) || 0;
              const itemsPerPage =
                parseInt(data.results["opensearch:itemsPerPage"]) || perPage;
              return Math.floor(startIndex / itemsPerPage) + 1;
            })(),
            perPage:
              parseInt(data.results["opensearch:itemsPerPage"]) || perPage,
            totalPages: Math.ceil(
              (parseInt(data.results["opensearch:totalResults"]) || 0) /
                (parseInt(data.results["opensearch:itemsPerPage"]) || perPage),
            ),
            totalItems: parseInt(data.results["opensearch:totalResults"]) || 0,
          };
        }
      } else {
        console.error("API request failed:", result.reason);
      }
    });

    console.log(
      "Processed results - Discogs:",
      discogsResults.length,
      "Last.fm:",
      lastfmResults.length,
    );

    const normalizedResults = normalizeResults(discogsResults, lastfmResults);
    console.log("Normalized results:", normalizedResults.length);

    return new Response(
      JSON.stringify({
        albums: normalizedResults,
        pagination,
        sources,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Search API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

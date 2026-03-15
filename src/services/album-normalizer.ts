import type { DiscogsSearchResult } from "../services/discogs";
import type { StandardAlbum } from "../types/album";

export const normalizeDiscogsResult = (result: any): StandardAlbum => {
  console.log("Normalizing Discogs result:", result);

  // Split title into artist and album name (Discogs format: "Artist - Album")
  const [artist, albumTitle] = result.title.split(" - ");

  return {
    id: `discogs-${result.id}`,
    title: albumTitle || result.title,
    artist: artist || "Unknown Artist",
    year: result.year,
    genre: [...new Set([...(result.genre ?? []), ...(result.style ?? [])])],
    coverImage:
      result.cover_image ||
      `https://images.placeholders.dev/?width=300&height=300&text=No+Cover`,
    source: "discogs",
    discogsId: result.id,
    discogsCatno: result.catno,
    discogsMasterId: result.master_id,
  };
};

export const normalizeLastFmResult = (result: any): StandardAlbum => {
  console.log("Normalizing Last.fm result:", result);

  // Get the largest available image
  const image =
    result.image.find((img: any) => img.size === "mega") ||
    result.image.find((img: any) => img.size === "extralarge") ||
    result.image.find((img: any) => img.size === "large") ||
    result.image[0];

  // Extract year from wiki if available (e.g., "May 1994" becomes "1994")
  let year: string | undefined;
  if (result.wiki?.summary) {
    const yearMatch = result.wiki.summary.match(/\b(\d{4})\b/);
    if (yearMatch) {
      year = yearMatch[1];
    }
  }

  // Extract genre tags from result if available
  const genre: string[] = [];
  if (result.tags?.tag) {
    result.tags.tag.forEach((tag: any) => {
      genre.push(tag.name);
    });
  }

  return {
    id: `lastfm-${result.mbid || result.url || result.name}`,
    title: result.name,
    artist: result.artist || "Unknown Artist",
    year: year,
    genre: genre.length > 0 ? genre : undefined,
    coverImage:
      image?.["#text"] ||
      `https://images.placeholders.dev/?width=300&height=300&text=No+Cover`,
    source: "lastfm",
    lastfmUrl: result.url,
    lastfmMbid: result.mbid,
  };
};

export const normalizeResults = (
  discogsResults?: any[],
  lastfmResults?: any[],
): StandardAlbum[] => {
  const normalized: StandardAlbum[] = [];

  if (discogsResults && Array.isArray(discogsResults)) {
    console.log("Processing Discogs results:", discogsResults.length);
    normalized.push(...discogsResults.map(normalizeDiscogsResult));
  }

  if (lastfmResults && Array.isArray(lastfmResults)) {
    console.log("Processing Last.fm results:", lastfmResults.length);
    normalized.push(...lastfmResults.map(normalizeLastFmResult));
  }

  console.log(
    "Total normalized results before deduplication:",
    normalized.length,
  );

  // Deduplicate results (same album from different sources)
  const uniqueResults = new Map<string, StandardAlbum>();

  for (const album of normalized) {
    // Create a unique key based on artist and title (case-insensitive)
    const key = `${(album.artist ?? "unknown").toLowerCase().trim()} - ${(
      album.title ?? "unknown"
    )
      .toLowerCase()
      .trim()}`;

    if (!uniqueResults.has(key)) {
      uniqueResults.set(key, album);
    } else {
      console.log("Duplicate album found:", key);
    }
  }

  console.log("Total unique results after deduplication:", uniqueResults.size);

  return Array.from(uniqueResults.values());
};

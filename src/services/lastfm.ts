export interface LastFmAlbum {
  name: string;
  artist: string;
  url: string;
  image: Array<{
    "#text": string;
    size: "small" | "medium" | "large" | "extralarge" | "mega";
  }>;
  streamable: string;
  mbid: string;
}

export interface LastFmSearchResult {
  album: LastFmAlbum;
}

export interface LastFmSearchResponse {
  results: {
    "opensearch:Query": {
      "#text": string;
      role: string;
      searchTerms: string;
      startPage: string;
    };
    "opensearch:totalResults": string;
    "opensearch:startIndex": string;
    "opensearch:itemsPerPage": string;
    albummatches: {
      album: LastFmSearchResult[];
    };
    "@attr": {
      for: string;
    };
  };
}

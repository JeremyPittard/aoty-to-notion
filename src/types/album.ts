export interface StandardAlbum {
  id: string;
  title: string;
  artist: string;
  year?: string;
  genre?: string[];
  coverImage: string;
  source: "discogs" | "lastfm";
  // Source-specific fields
  discogsId?: number;
  discogsCatno?: string;
  discogsMasterId?: number;
  lastfmUrl?: string;
  lastfmMbid?: string;
}

export interface PaginationInfo {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}

export interface SearchOptions {
  sources?: ("discogs" | "lastfm")[];
  page?: number;
  perPage?: number;
  genre?: string;
  year?: string;
}

export interface SearchResults {
  albums: StandardAlbum[];
  pagination: PaginationInfo;
  sources: ("discogs" | "lastfm")[];
}

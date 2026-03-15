export interface DiscogsSearchResult {
  country: string;
  year: string;
  format: string[];
  label: string[];
  type: string;
  genre: string[];
  style: string[];
  id: number;
  barcode: string[];
  user_data: {
    in_wantlist: boolean;
    in_collection: boolean;
  };
  master_id: number;
  master_url: string;
  uri: string;
  catno: string;
  title: string;
  thumb: string;
  cover_image: string;
  resource_url: string;
  community: {
    want: number;
    have: number;
  };
}

export interface DiscogsSearchResponse {
  results: DiscogsSearchResult[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
}

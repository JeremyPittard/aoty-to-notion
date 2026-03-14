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

export const searchAlbums = async (albumName: string) => {
  const res = await fetch(
    `https://api.discogs.com/database/search?q=${encodeURIComponent(
      albumName,
    )}&type=master&sort=date_added&sort_order=desc`,
    {
      headers: {
        Authorization: `Discogs token=ZCrqJSSbZXDfbhHzDfflSWbEMrDylZsxGeebCMhK`,
      },
    },
  );
  const data: DiscogsSearchResponse = await res.json();
  return data.results;
};

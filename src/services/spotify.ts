import { SpotifyApi, type SimplifiedAlbum } from "@spotify/web-api-ts-sdk";

type albumTitle = string;

const spotify = SpotifyApi.withClientCredentials(
  import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID,
  import.meta.env.PUBLIC_SPOTIFY_CLIENT_SECRET
);

export const getAlbums = async (albumTitle: albumTitle) => {
  const albums: SimplifiedAlbum[] = (
    await spotify.search(albumTitle, ["album"], 'AU', 50)
  ).albums.items;
  return albums;
};

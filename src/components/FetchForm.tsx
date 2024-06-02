import { useState, type FormEvent } from "react";
import { getAlbums } from "../services/spotify";
import type { Album, Albums } from "@spotify/web-api-ts-sdk";

const FetchForm = () => {
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [albums, setAlbums] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleSubmit = async (event: FormEvent) => {
    event?.preventDefault();
    setAlbums(null);
    const albums = await getAlbums(albumTitle);
    setIsLoading(true);

    const sortedAlbums = albums.sort((a, b) => {
      if (a.name === albumTitle) {
        return -1;
      } else if (b.name === albumTitle) {
        return 1;
      } else {
        return 0;
      }
    });

    setAlbums(sortedAlbums);
    setIsLoading(false);
  };

  return (
    <section className="max-w-2xl mx-auto">
      <h1>AOTY</h1>
      <label>
        <input
          type="text"
          name="name"
          onChange={(e) => setAlbumTitle(e.target.value)}
        />
      </label>
      <button type="button" onClick={handleSubmit}>
        Go!
      </button>
      {isLoading ? <h2>doing the thing</h2> : null}
      {albums?.map((album: Album) => (
        <details key={album.id}>
          <summary>{`${album.artists[0].name} - ${album.name}`}</summary>
          <table>
            <tr>
              <td>Artist:</td>
              <td>{album.artists.map((artist) => artist.name)}</td>
            </tr>
            <tr>
              <td>Album:</td>
              <td>{album.name}</td>
            </tr>
            <tr>
              <td>Image Url:</td>
              <td>{album.images[0].url}</td>
            </tr>
            <tr>
              <td>Embed:</td>
              <td>{album.external_urls.spotify}</td>
            </tr>
          </table>
        </details>
      ))}
    </section>
  );
};

export default FetchForm;

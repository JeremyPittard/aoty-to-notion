import { useState, type FormEvent } from "react";
import { getAlbums } from "../services/spotify";
import type { Album, Albums } from "@spotify/web-api-ts-sdk";

const FetchForm = () => {
  const handleSubmit = async (event: FormEvent) => {
    event?.preventDefault();
    const albums = await getAlbums(albumTitle);

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
  };

  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [albums, setAlbums] = useState<any>();

  return (
    <>
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
      <ul>
        {albums?.map((album: Album) => (
          <li key={album.id}>
            <button onClick={() => console.log(album)}>
              {album.artists[0].name} - {album.name}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default FetchForm;

import { useState, type FormEvent } from "react";
import { getAlbums } from "../../services/spotify";
import AlbumCard from "../album-card";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";

const FetchForm = () => {
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [albums, setAlbums] = useState<SimplifiedAlbum[] | null>(null);
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
    console.log(sortedAlbums);
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
      <div className="flex flex-col gap-4">
        {isLoading ? <h2>doing the thing</h2> : null}
        {albums?.map((album: SimplifiedAlbum) => (
          <AlbumCard album={album} />
        ))}
      </div>
    </section>
  );
};

export default FetchForm;

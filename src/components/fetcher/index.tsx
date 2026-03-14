import { useState, type FormEvent } from "react";
import { searchAlbums, type DiscogsSearchResult } from "../../services/discogs";
import AlbumCard from "../album-card";

const FetchForm = () => {
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [albums, setAlbums] = useState<DiscogsSearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleSubmit = async (event: FormEvent) => {
    event?.preventDefault();
    setIsLoading(true);
    setAlbums(null);
    const albums = await searchAlbums(albumTitle);
    setAlbums(albums);
    setIsLoading(false);
  };

  return (
    <section className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="p-4">
          <div className="flex flex-col">
            <label htmlFor="name">Enter an album title:</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={(e) => setAlbumTitle(e.target.value)}
            />
            <button type="submit">Go!</button>
          </div>
        </div>
      </form>
      <div className="flex flex-col gap-4">
        {isLoading ? <h2>doing the thing</h2> : null}
        {albums?.map((album: DiscogsSearchResult) => (
          <AlbumCard album={album} key={album.catno + album.master_id} />
        ))}
      </div>
    </section>
  );
};

export default FetchForm;

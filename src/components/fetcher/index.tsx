import { useState, type FormEvent } from "react";
import type { DiscogsSearchResult } from "../../services/discogs";
import AlbumCard from "../album-card";

const FetchForm = () => {
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [albums, setAlbums] = useState<DiscogsSearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleSubmit = async (event: FormEvent) => {
    event?.preventDefault();
    setIsLoading(true);
    setAlbums(null);
    const res = await fetch("/api/dicogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumName: albumTitle }),
    });
    const data = await res.json();
    setAlbums(data.results);
    setIsLoading(false);
  };

  return (
    <>
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
      </section>
      <section className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4 ">
          {isLoading ? <AlbumCard skeleton={true} /> : null}
          {albums?.map((album: DiscogsSearchResult) => (
            <AlbumCard album={album} key={album.catno + album.master_id} />
          ))}
        </div>
      </section>
    </>
  );
};

export default FetchForm;

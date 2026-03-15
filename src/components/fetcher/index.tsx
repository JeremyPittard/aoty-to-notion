import { useState, type FormEvent } from "react";
import type {
  StandardAlbum,
  PaginationInfo,
  SearchOptions,
} from "../../types/album";
import AlbumCard from "../album-card";

const FetchForm = () => {
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [albums, setAlbums] = useState<StandardAlbum[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sources, setSources] = useState<("discogs" | "lastfm")[]>(["lastfm"]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);

  const handleSubmit = async (event: FormEvent) => {
    event?.preventDefault();
    setIsLoading(true);
    setAlbums(null);
    setCurrentPage(1);

    const searchOptions: SearchOptions = {
      sources,
      page: 1,
      perPage,
    };

    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        albumName: albumTitle,
        ...searchOptions,
      }),
    });

    const data = await res.json();
    setAlbums(data.albums);
    setPagination(data.pagination);
    setIsLoading(false);
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) {
      return;
    }

    setIsLoading(true);
    setCurrentPage(newPage);

    const searchOptions: SearchOptions = {
      sources,
      page: newPage,
      perPage,
    };

    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        albumName: albumTitle,
        ...searchOptions,
      }),
    });

    const data = await res.json();
    setAlbums(data.albums);
    setPagination(data.pagination);
    setIsLoading(false);
  };

  const handleSourceToggle = (source: "discogs" | "lastfm") => {
    setSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  return (
    <>
      <section className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="flex flex-col space-y-4">
              <label htmlFor="name">Enter an album title:</label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={(e) => setAlbumTitle(e.target.value)}
                className="border p-2 rounded"
              />

              <div className="space-y-2">
                <label>Search Sources:</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sources.includes("discogs")}
                      onChange={() => handleSourceToggle("discogs")}
                      className="mr-2"
                    />
                    Discogs
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sources.includes("lastfm")}
                      onChange={() => handleSourceToggle("lastfm")}
                      className="mr-2"
                    />
                    Last.fm
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label>Results per page:</label>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(parseInt(e.target.value))}
                  className="border p-2 rounded"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={sources.length === 0}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4">
          {isLoading ? <AlbumCard skeleton={true} /> : null}
          {albums?.map((album: StandardAlbum) => (
            <AlbumCard album={album} key={album.id} />
          ))}

          {albums && albums.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No albums found. Try adjusting your search query.
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages || isLoading}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default FetchForm;

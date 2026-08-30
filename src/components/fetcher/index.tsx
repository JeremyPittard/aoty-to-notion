import { useEffect, useState, type FormEvent } from "react";
import { Menu } from "lucide-react";
import type {
  StandardAlbum,
  PaginationInfo,
  SearchOptions,
  SentAlbum,
} from "../../types/album";
import { defaultCoverImage, sendToNotion } from "../../services/notion";
import AlbumCard from "../album-card";
import SuccessModal from "../success-modal";

const sentAlbumsStorageKey = "aoty-sent-albums";

const FetchForm = () => {
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [albums, setAlbums] = useState<StandardAlbum[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sources, setSources] = useState<("discogs" | "lastfm")[]>(["lastfm"]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSendingCustom, setIsSendingCustom] = useState(false);
  const [isSentAlbumsModalOpen, setIsSentAlbumsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [sentAlbums, setSentAlbums] = useState<SentAlbum[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const storedAlbums = window.localStorage.getItem(sentAlbumsStorageKey);
      const parsedAlbums = storedAlbums ? JSON.parse(storedAlbums) : [];
      return Array.isArray(parsedAlbums) ? parsedAlbums : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(
      sentAlbumsStorageKey,
      JSON.stringify(sentAlbums),
    );
  }, [sentAlbums]);

  const fetchSearchResults = async (payload: { albumName: string; sources?: ("discogs" | "lastfm")[]; page?: number; perPage?: number }) => {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    const data = await res.json();
    return { albums: data.albums, pagination: data.pagination };
  };

  const handleSubmit = async (event: FormEvent) => {
    event?.preventDefault();
    setIsLoading(true);
    setAlbums(null);
    setCurrentPage(1);
    setError(null);

    const searchOptions: SearchOptions = {
      sources,
      page: 1,
      perPage,
    };

    try {
      const data = await fetchSearchResults({
        albumName: albumTitle,
        ...searchOptions,
      });
      setAlbums(data.albums);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) {
      return;
    }

    setIsLoading(true);
    setCurrentPage(newPage);
    setError(null);

    const searchOptions: SearchOptions = {
      sources,
      page: newPage,
      perPage,
    };

    try {
      const data = await fetchSearchResults({
        albumName: albumTitle,
        ...searchOptions,
      });
      setAlbums(data.albums);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Page change failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceToggle = (source: "discogs" | "lastfm") => {
    setSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const handleSendCustom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("customAlbumName"));
    const artist = String(formData.get("customBandName"));
    const year = String(formData.get("customYear"));
    const genre = String(formData.get("customGenre") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    setIsSendingCustom(true);
    try {
      await sendToNotion({
        title,
        artist,
        year,
        genre,
      });
      setSentAlbums((previousAlbums) => [
        ...previousAlbums,
        {
          title,
          artist,
          year,
          genre,
          coverImage: defaultCoverImage,
          sentAt: new Date().toISOString(),
        },
      ]);
      setIsCustomModalOpen(false);
      form.reset();
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Error sending custom album to Notion:", err);
      alert("Failed to send to Notion. Check console for details.");
    } finally {
      setIsSendingCustom(false);
    }
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

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={sources.length === 0}
                  className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="rounded border border-blue-500 p-2 text-blue-700 hover:bg-blue-50"
                >
                  Send Custom
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      {isCustomModalOpen && (
        <dialog
          open
          aria-labelledby="global-custom-album-title"
          className="fixed inset-0 z-10 m-auto w-[calc(100%-2rem)] max-w-md rounded border border-neutral-300 bg-white p-0 text-neutral-900 shadow-xl"
        >
          <form onSubmit={handleSendCustom} className="flex flex-col gap-4 p-6">
            <div>
              <h2 id="global-custom-album-title" className="text-xl font-bold">
                Send a custom album
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Add the details for an album that was not found in search.
              </p>
            </div>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="customAlbumName">
              Album Name
              <input
                id="customAlbumName"
                name="customAlbumName"
                type="text"
                required
                autoFocus
                className="rounded border border-neutral-300 p-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="customBandName">
              Band Name
              <input
                id="customBandName"
                name="customBandName"
                type="text"
                required
                className="rounded border border-neutral-300 p-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="customYear">
              Year
              <input
                id="customYear"
                name="customYear"
                type="text"
                inputMode="numeric"
                required
                pattern="[0-9]{4}"
                title="Enter a four-digit year"
                className="rounded border border-neutral-300 p-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="customGenre">
              Genre <span className="font-normal text-neutral-500">(optional)</span>
              <input
                id="customGenre"
                name="customGenre"
                type="text"
                className="rounded border border-neutral-300 p-2 font-normal"
              />
            </label>

            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                disabled={isSendingCustom}
                className="rounded border border-neutral-300 px-4 py-2 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSendingCustom}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSendingCustom ? "Sending..." : "Send to Notion"}
              </button>
            </div>
          </form>
        </dialog>
      )}

      {sentAlbums.length > 0 && (
        <button
          type="button"
          onClick={() => setIsSentAlbumsModalOpen(true)}
          aria-label={`Review sent albums (${sentAlbums.length})`}
          title={`Review sent albums (${sentAlbums.length})`}
          className="fixed right-4 top-4 z-10 rounded border border-neutral-300 bg-white p-3 text-neutral-800 shadow transition hover:bg-neutral-50"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      )}

      <section className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4">
          {isLoading ? <AlbumCard skeleton={true} /> : null}
          {albums?.map((album: StandardAlbum) => (
            <AlbumCard
              album={album}
              key={album.id}
              onSent={(sentAlbum) =>
                setSentAlbums((previousAlbums) => [...previousAlbums, sentAlbum])
              }
            />
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

      <>
        <button
          type="button"
          aria-label="Close sent albums"
          onClick={() => setIsSentAlbumsModalOpen(false)}
          className={`sent-albums-backdrop fixed inset-0 z-20 h-full w-full cursor-default bg-black/30 ${
            isSentAlbumsModalOpen ? "is-open" : ""
          }`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="sent-albums-title"
          className={`sent-albums-sidebar fixed inset-y-0 right-0 z-30 flex w-fit max-w-[100vw] flex-col border-l border-neutral-300 bg-white text-neutral-900 shadow-xl ${
            isSentAlbumsModalOpen ? "is-open" : ""
          }`}
        >
            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 p-6">
              <h2 id="sent-albums-title" className="text-xl font-bold">
                Sent albums ({sentAlbums.length})
              </h2>
              <button
                type="button"
                onClick={() => setIsSentAlbumsModalOpen(false)}
                className="text-sm text-neutral-600 underline-offset-2 hover:underline"
              >
                Close
              </button>
            </div>

            <div className="max-w-[100vw] overflow-x-auto p-6">
              <div className="grid w-max auto-cols-[minmax(18rem,22rem)] grid-flow-col grid-rows-6 gap-4">
                {sentAlbums.map((sentAlbum, index) => (
                  <article
                    key={`${sentAlbum.sentAt}-${index}`}
                    className="flex min-h-24 gap-4 border-b border-neutral-100 pb-4"
                  >
                    <img
                      src={sentAlbum.coverImage || defaultCoverImage}
                      alt={`${sentAlbum.artist} - ${sentAlbum.title}`}
                      className="h-20 w-20 shrink-0 rounded object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-neutral-900">
                        {sentAlbum.title}
                      </h3>
                      <p className="text-sm text-neutral-700">
                        {sentAlbum.artist} ({sentAlbum.year})
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {sentAlbum.genre.join(", ") || "Unknown Genre"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-neutral-200 p-6">
              <button
                type="button"
                onClick={() => {
                  setSentAlbums([]);
                  setIsSentAlbumsModalOpen(false);
                }}
                className="text-sm text-neutral-600 underline-offset-2 hover:underline"
              >
                Clear history
              </button>
            </div>
        </aside>
        <style>{`
          .sent-albums-backdrop {
            opacity: 0;
            pointer-events: none;
            transition: opacity 200ms ease;
          }

          .sent-albums-backdrop.is-open {
            opacity: 1;
            pointer-events: auto;
          }

          .sent-albums-sidebar {
            transform: translateX(100%);
            transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
            visibility: hidden;
          }

          .sent-albums-sidebar.is-open {
            transform: translateX(0);
            visibility: visible;
          }

          @media (prefers-reduced-motion: reduce) {
            .sent-albums-backdrop,
            .sent-albums-sidebar {
              transition: none;
            }
          }
        `}</style>
      </>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </>
  );
};

export default FetchForm;

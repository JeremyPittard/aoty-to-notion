import { useEffect, useRef, useState, type FormEvent } from "react";
import { Download, Menu } from "lucide-react";
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
const resultsPerPage = 20;

const FetchForm = () => {
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [albums, setAlbums] = useState<StandardAlbum[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sources, setSources] = useState<("discogs" | "lastfm")[]>(["lastfm"]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSendingCustom, setIsSendingCustom] = useState(false);
  const [isSentAlbumsModalOpen, setIsSentAlbumsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isExportingNotionList, setIsExportingNotionList] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
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

  const handleExportNotionList = async () => {
    setIsExportingNotionList(true);

    try {
      const response = await fetch("/api/notion-export");

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to export the Notion list.");
      }

      const fileUrl = URL.createObjectURL(await response.blob());
      const downloadLink = document.createElement("a");
      downloadLink.href = fileUrl;
      downloadLink.download = "aoty-albums.md";
      document.body.append(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } catch (exportError) {
      console.error("Notion export failed:", exportError);
      window.alert(
        exportError instanceof Error
          ? exportError.message
          : "Failed to export the Notion list.",
      );
    } finally {
      setIsExportingNotionList(false);
    }
  };

  const fetchSearchResults = async (payload: {
    albumName: string;
    sources?: ("discogs" | "lastfm")[];
    page?: number;
    perPage?: number;
  }) => {
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
    event.preventDefault();
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setAlbums(null);
    setPagination(null);
    setCurrentPage(1);
    setError(null);

    try {
      const data = await fetchSearchResults({
        albumName: albumTitle,
        sources,
        page: 1,
        perPage: resultsPerPage,
      });
      setAlbums(data.albums);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  const loadNextPage = async () => {
    if (
      isLoadingRef.current ||
      !pagination ||
      currentPage >= pagination.totalPages
    ) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    const searchOptions: SearchOptions = {
      sources,
      page: currentPage + 1,
      perPage: resultsPerPage,
    };

    try {
      const data = await fetchSearchResults({
        albumName: albumTitle,
        ...searchOptions,
      });
      setAlbums((previousAlbums) => {
        const existingIds = new Set(previousAlbums?.map((album) => album.id));
        return [
          ...(previousAlbums ?? []),
          ...data.albums.filter((album: StandardAlbum) => !existingIds.has(album.id)),
        ];
      });
      setCurrentPage((page) => page + 1);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Loading more albums failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !albums || !pagination || currentPage >= pagination.totalPages || isLoading || error) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void loadNextPage();
    }, { rootMargin: "300px" });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [albums, currentPage, error, isLoading, pagination]);

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
                      className="mr-2 accent-palette-paper"
                    />
                    Discogs
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sources.includes("lastfm")}
                      onChange={() => handleSourceToggle("lastfm")}
                      className="mr-2 accent-palette-paper"
                    />
                    Last.fm
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={sources.length === 0 || isLoading}
                  className="rounded border border-palette-line p-2 text-palette-paper hover:bg-palette-raised disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="send-custom-link text-palette-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-palette-paper"
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
          className="app-modal fixed inset-0 z-10 m-auto w-[calc(100%-2rem)] max-w-md rounded border border-palette-line p-0 shadow-xl"
        >
          <form onSubmit={handleSendCustom} className="flex flex-col gap-4 p-6">
            <div>
              <h2 id="global-custom-album-title" className="font-serif text-xl font-bold">
                Send a custom album
              </h2>
              <p className="mt-1 text-sm text-palette-muted">
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
                className="rounded border border-palette-line p-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="customBandName">
              Band Name
              <input
                id="customBandName"
                name="customBandName"
                type="text"
                required
                className="rounded border border-palette-line p-2 font-normal"
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
                className="rounded border border-palette-line p-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="customGenre">
              Genre <span className="font-normal text-palette-muted">(optional)</span>
              <input
                id="customGenre"
                name="customGenre"
                type="text"
                className="rounded border border-palette-line p-2 font-normal"
              />
            </label>

            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                disabled={isSendingCustom}
                className="rounded border border-palette-line px-4 py-2 hover:bg-palette-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSendingCustom}
                className="rounded bg-palette-paper px-4 py-2 text-palette-ink hover:bg-palette-highlight disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSendingCustom ? "Sending..." : "Send to Notion"}
              </button>
            </div>
          </form>
        </dialog>
      )}

      <div className="fixed right-4 top-4 z-10 flex gap-2" role="toolbar" aria-label="Album list actions">
        <button
          type="button"
          onClick={() => void handleExportNotionList()}
          disabled={isExportingNotionList}
          aria-busy={isExportingNotionList}
          aria-label={isExportingNotionList ? "Exporting album list" : "Download album list as Markdown"}
          title={isExportingNotionList ? "Exporting album list" : "Download album list as Markdown"}
          className="rounded border border-palette-line bg-palette-surface p-3 text-palette-paper shadow transition hover:bg-palette-raised disabled:cursor-wait disabled:opacity-60"
        >
          <Download size={22} aria-hidden="true" />
        </button>

        {sentAlbums.length > 0 && !isSentAlbumsModalOpen && (
          <button
            type="button"
            onClick={() => setIsSentAlbumsModalOpen(true)}
            aria-label={`Review sent albums (${sentAlbums.length})`}
            title={`Review sent albums (${sentAlbums.length})`}
            className="rounded border border-palette-line bg-palette-surface p-3 text-palette-paper shadow transition hover:bg-palette-raised"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        )}
      </div>

      <section className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4">
          {isLoading && !albums ? <AlbumCard skeleton={true} /> : null}
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
            <div className="py-8 text-center text-palette-muted">
              No albums found. Try adjusting your search query.
            </div>
          )}

          {error && (
            <div role="alert" className="py-4 text-center text-rose-300">
              <p>{error}</p>
              {albums && pagination && currentPage < pagination.totalPages && (
                <button
                  type="button"
                  onClick={() => void loadNextPage()}
                  className="mt-2 underline underline-offset-2"
                >
                  Retry loading albums
                </button>
              )}
            </div>
          )}

          {isLoading && albums && (
            <div className="py-4 text-center text-sm text-palette-muted" role="status">
              Loading more albums...
            </div>
          )}

          {albums && pagination && currentPage < pagination.totalPages && (
            <div ref={sentinelRef} aria-hidden="true" className="h-1" />
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
          className={`sent-albums-sidebar fixed inset-y-0 right-0 z-30 flex w-fit max-w-[100vw] flex-col bg-palette-raised text-palette-paper shadow-xl ${
            isSentAlbumsModalOpen ? "is-open" : ""
          }`}
        >
            <div className="flex items-center justify-between gap-4 p-6">
              <h2 id="sent-albums-title" className="font-serif text-xl font-bold">
                Sent albums ({sentAlbums.length})
              </h2>
              <button
                type="button"
                onClick={() => setIsSentAlbumsModalOpen(false)}
                className="text-sm text-palette-muted underline-offset-2 hover:text-palette-paper hover:underline"
              >
                Close
              </button>
            </div>

            <div className="max-w-[100vw] flex-1 overflow-x-auto bg-palette-surface p-6">
              <div className="grid w-max auto-cols-[minmax(18rem,22rem)] grid-flow-col grid-rows-6 gap-4">
                {sentAlbums.map((sentAlbum, index) => (
                  <article
                    key={`${sentAlbum.sentAt}-${index}`}
                    className="flex min-h-24 gap-4 pb-4"
                  >
                    <img
                      src={sentAlbum.coverImage || defaultCoverImage}
                      alt={`${sentAlbum.artist} - ${sentAlbum.title}`}
                      className="h-20 w-20 shrink-0 rounded object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h3 className="font-serif font-semibold text-palette-paper">
                        {sentAlbum.title}
                      </h3>
                      <p className="text-sm text-palette-muted">
                        {sentAlbum.artist} ({sentAlbum.year})
                      </p>
                      <p className="mt-1 text-sm text-palette-muted">
                        {sentAlbum.genre.join(", ") || "Unknown Genre"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex justify-end p-6">
              <button
                type="button"
                onClick={() => {
                  setSentAlbums([]);
                  setIsSentAlbumsModalOpen(false);
                }}
                className="text-sm text-palette-muted underline-offset-2 hover:text-palette-paper hover:underline"
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

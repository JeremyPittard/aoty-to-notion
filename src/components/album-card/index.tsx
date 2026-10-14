import { useState, type FormEvent } from "react";
import type { SentAlbum, StandardAlbum } from "../../types/album";
import { sendToNotion } from "../../services/notion";
import SuccessModal from "../success-modal";

type AlbumCardProps = {
  album?: StandardAlbum;
  skeleton?: boolean;
  onSent?: (album: SentAlbum) => void;
};

const AlbumCard = ({ album, skeleton, onSent }: AlbumCardProps) => {
  if (skeleton) {
    return (
      <article className="group grid h-64 max-w-2xl animate-pulse overflow-hidden border-b border-palette-line bg-transparent text-palette-muted">
        <div className="block h-full w-full animate-pulse bg-palette-gray"></div>
      </article>
    );
  }

  if (!album) return null;

  const genres = album.genre || [];
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSendingCustom, setIsSendingCustom] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSendToNotion = async () => {
    try {
      await sendToNotion(album);
      onSent?.({
        ...album,
        year: album.year || new Date().getFullYear().toString(),
        genre: album.genre || [],
        sentAt: new Date().toISOString(),
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error sending to Notion:", error);
      alert("Failed to send to Notion. Check console for details.");
    }
  };

  const handleSendCustom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSendingCustom(true);
    try {
      const genre = String(formData.get("genre") || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      await sendToNotion({
        title: String(formData.get("albumName")),
        artist: String(formData.get("bandName")),
        year: String(formData.get("year")),
        genre,
        coverImage: album.coverImage,
      });
      onSent?.({
        title: String(formData.get("albumName")),
        artist: String(formData.get("bandName")),
        year: String(formData.get("year")),
        genre,
        coverImage: album.coverImage,
        source: album.source,
        sentAt: new Date().toISOString(),
      });
      setIsCustomModalOpen(false);
      form.reset();
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error sending custom album to Notion:", error);
      alert("Failed to send to Notion. Check console for details.");
    } finally {
      setIsSendingCustom(false);
    }
  };

  return (
    <article className="group grid h-64 max-w-2xl grid-cols-1 overflow-hidden border-b border-palette-line bg-transparent text-palette-muted md:grid-cols-8">
      <div className="col-span-3 overflow-hidden">
        <img
          src={album.coverImage}
          className="h-52 md:h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          alt={`${album.artist} - ${album.title}`}
          loading="lazy"
        />
      </div>
      <div className="flex flex-col justify-center p-6 col-span-5">
        <small className="mb-4 font-medium">{album.artist}</small>
        <h3 className="text-balance font-serif text-xl font-medium text-palette-paper lg:text-2xl">
          {album.title}
        </h3>
        <p className="my-4 max-w-lg text-pretty text-sm">
          {genres.join(", ") || "Unknown Genre"}
        </p>
        {album.year && (
          <p className="mb-2 text-xs text-palette-muted">{album.year}</p>
        )}
        <div className="flex items-center space-x-2 mb-4">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              album.source === "discogs"
                ? "bg-palette-gray text-palette-paper"
                : "bg-palette-paper text-palette-ink"
            }`}
          >
            {album.source === "discogs" ? "Discogs" : "Last.fm"}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap gap-4">
          <button
            onClick={handleSendToNotion}
            className="send-custom-link w-fit font-medium text-palette-paper"
            type="button"
          >
            Send It!
          </button>
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="send-custom-link w-fit font-medium text-palette-muted"
            type="button"
          >
            Edit
          </button>
        </div>
      </div>

      {isCustomModalOpen && (
        <dialog
          open
          aria-labelledby="custom-album-title"
          className="app-modal fixed inset-0 z-10 m-auto w-[calc(100%-2rem)] max-w-md rounded border border-palette-line p-0 shadow-xl"
        >
          <form onSubmit={handleSendCustom} className="flex flex-col gap-4 p-6">
            <div>
              <h2 id="custom-album-title" className="font-serif text-xl font-bold">
                Edit album
              </h2>
              <p className="mt-1 text-sm text-palette-muted">
                Update the details before sending this album to Notion.
              </p>
            </div>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="albumName">
              Album Name
              <input
                id="albumName"
                name="albumName"
                type="text"
                required
                autoFocus
                defaultValue={album.title}
                className="rounded border border-palette-line p-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="bandName">
              Band Name
              <input
                id="bandName"
                name="bandName"
                type="text"
                required
                defaultValue={album.artist}
                className="rounded border border-palette-line p-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="year">
              Year
              <input
                id="year"
                name="year"
                type="text"
                inputMode="numeric"
                required
                pattern="[0-9]{4}"
                title="Enter a four-digit year"
                defaultValue={album.year || new Date().getFullYear().toString()}
                className="rounded border border-palette-line p-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="genre">
              Genre <span className="font-normal text-palette-muted">(optional)</span>
              <input
                id="genre"
                name="genre"
                type="text"
                defaultValue={album.genre?.join(", ")}
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
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </article>
  );
};

export default AlbumCard;

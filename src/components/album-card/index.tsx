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
      <article className="h-64 group grid animate-pulse rounded-sm max-w-2xl overflow-hidden border border-neutral-300 bg-neutral-50 text-neutral-600 ">
        <div className="h-full w-full block animate-pulse bg-gray-400"></div>
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
    <article className="group grid rounded-sm max-w-2xl grid-cols-1 md:grid-cols-8 overflow-hidden border border-neutral-300 bg-neutral-50 text-neutral-600 h-64 ">
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
        <h3 className="text-balance text-xl font-bold text-neutral-900 lg:text-2xl ">
          {album.title}
        </h3>
        <p className="my-4 max-w-lg text-pretty text-sm">
          {genres.join(", ") || "Unknown Genre"}
        </p>
        {album.year && (
          <p className="text-xs text-gray-500 mb-2">{album.year}</p>
        )}
        <div className="flex items-center space-x-2 mb-4">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              album.source === "discogs"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {album.source === "discogs" ? "Discogs" : "Last.fm"}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap gap-4">
          <button
            onClick={handleSendToNotion}
            className="w-fit font-medium text-black underline-offset-2 hover:underline focus:underline focus:outline-hidden"
            type="button"
          >
            Send It!
          </button>
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="w-fit font-medium text-blue-700 underline-offset-2 hover:underline focus:underline focus:outline-hidden"
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
          className="fixed inset-0 z-10 m-auto w-[calc(100%-2rem)] max-w-md rounded border border-neutral-300 bg-white p-0 text-neutral-900 shadow-xl"
        >
          <form onSubmit={handleSendCustom} className="flex flex-col gap-4 p-6">
            <div>
              <h2 id="custom-album-title" className="text-xl font-bold">
                Edit album
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
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
                className="rounded border border-neutral-300 p-2 font-normal"
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
                className="rounded border border-neutral-300 p-2 font-normal"
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
                className="rounded border border-neutral-300 p-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="genre">
              Genre <span className="font-normal text-neutral-500">(optional)</span>
              <input
                id="genre"
                name="genre"
                type="text"
                defaultValue={album.genre?.join(", ")}
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
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </article>
  );
};

export default AlbumCard;

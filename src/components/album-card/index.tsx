import type { StandardAlbum } from "../../types/album";
import { sendToNotion } from "../../services/notion";

type AlbumCardProps = {
  album?: StandardAlbum;
  skeleton?: boolean;
};

const AlbumCard = ({ album, skeleton }: AlbumCardProps) => {
  if (skeleton) {
    return (
      <article className="h-64 group grid animate-pulse rounded-sm max-w-2xl overflow-hidden border border-neutral-300 bg-neutral-50 text-neutral-600 ">
        <div className="h-full w-full block animate-pulse bg-gray-400"></div>
      </article>
    );
  }

  if (!album) return null;

  const genres = album.genre || [];

  const handleSendToNotion = async () => {
    try {
      await sendToNotion(album);
      alert("Successfully sent to Notion!");
    } catch (error) {
      console.error("Error sending to Notion:", error);
      alert("Failed to send to Notion. Check console for details.");
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
        <button
          onClick={handleSendToNotion}
          className="mt-auto w-fit font-medium text-black underline-offset-2 hover:underline focus:underline focus:outline-hidden"
          type="button"
        >
          Send It!
        </button>
      </div>
    </article>
  );
};

export default AlbumCard;

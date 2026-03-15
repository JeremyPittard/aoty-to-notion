import type { DiscogsSearchResult } from "../../services/discogs";
import { sendToNotion } from "../../services/notion";

type AlbumCardProps = {
  album?: DiscogsSearchResult;
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

  const genres = [
    ...new Set([...(album?.genre ?? []), ...(album?.style ?? [])]),
  ];

  const handleSendToNotion = async () => {
    try {
      await sendToNotion(album);
      alert("Successfully sent to Notion!");
    } catch (error) {
      console.error("Error sending to Notion:", error);
      alert("Failed to send to Notion. Check console for details.");
    }
  };

  // Split title into artist and album name
  const [artist, albumTitle] = album.title.split(" - ");

  return (
    <article className="group grid rounded-sm max-w-2xl grid-cols-1 md:grid-cols-8 overflow-hidden border border-neutral-300 bg-neutral-50 text-neutral-600 h-64 ">
      <div className="col-span-3 overflow-hidden">
        <img
          src={
            album?.cover_image ??
            `https://images.placeholders.dev/?width=300&height=300&text=No+Cover`
          }
          className="h-52 md:h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          alt=""
        />
      </div>
      <div className="flex flex-col justify-center p-6 col-span-5">
        <small className="mb-4 font-medium">{artist}</small>
        <h3 className="text-balance text-xl font-bold text-neutral-900 lg:text-2xl ">
          {albumTitle || album?.title}
        </h3>
        <p className="my-4 max-w-lg text-pretty text-sm">{genres.join(", ")}</p>
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

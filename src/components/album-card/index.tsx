import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import { Copy } from "lucide-react";
import type { DiscogsSearchResult } from "../../services/discogs";

type AlbumCardProps = {
  album: DiscogsSearchResult;
};

const copyContent = async (string: string) => {
  try {
    await navigator.clipboard.writeText(string);
    console.log(string);
    /* Resolved - text copied to clipboard successfully */
  } catch (err) {
    console.error("Failed to copy: ", err);
    /* Rejected - text failed to copy to the clipboard */
  }
};

const AlbumCard = ({ album }: AlbumCardProps) => {
  const genres = [[...new Set([...album.genre, ...album.style])]];
  return (
    <article className="album-card flex rounded-lg border-gray-200 border-2">
      <img
        src={album.cover_image}
        alt=""
        height={144}
        width={144}
        className="self-start"
        loading="lazy"
      />
      <div className="details px-2 pb-2">
        <h2 className="font-bold flex items-center">{album.title}</h2>
        <br />
        <table>
          <tr>
            <td>
              <p className="font-semibold">Artist Name:</p>
            </td>
            <td>
              <p>{album.title}</p>
            </td>
          </tr>
          <tr>
            <td>
              <p className="font-semibold">Album Name:</p>
            </td>
            <td>
              <p>{album.title}</p>
            </td>
          </tr>
          {genres ? (
            <tr>
              <td>
                <p className="font-semibold">Genres:</p>
              </td>
              <td>{genres.map((genre) => genre)}</td>
            </tr>
          ) : null}
        </table>
        <button>Send it</button>
      </div>
    </article>
  );
};

export default AlbumCard;

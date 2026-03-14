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
    <article className="album-card flex p-4">
      <img
        src={album.cover_image}
        alt=""
        height={144}
        width={144}
        onClick={() => copyContent(album.cover_image)}
        className="cursor-pointer self-start"
        loading="lazy"
      />
      <div className="details px-2 pb-2">
        <h2 className="font-bold flex items-center">
          {album.title}
          <button
            className="ml-3"
            onClick={() => copyContent(`${album.title} - ${album.title}`)}
          >
            <Copy />
          </button>
        </h2>
        <table>
          <tr>
            <td>
              <p className="font-semibold">Artist Name:</p>
            </td>
            <td>
              <p>{album.title}</p>
            </td>
            <td>
              <button onClick={() => copyContent(album.title)}>
                <Copy />
              </button>
            </td>
          </tr>
          <tr>
            <td>
              <p className="font-semibold">Album Name:</p>
            </td>
            <td>
              <p>{album.title}</p>
            </td>
            <td>
              <button onClick={() => copyContent(album.title)}>
                <Copy />
              </button>
            </td>
          </tr>

          {/* currently does not return anything from spotify, they don't plan on fixing it soon so included just incase it ever starts working and I don't have to constantly check */}
          {genres ? (
            <tr>
              <td>
                <p className="font-semibold">Genres:</p>
              </td>
              <td>{genres.map((genre) => genre)}</td>
              <td>
                <button
                  onClick={() =>
                    copyContent(genres.map((genre) => genre).join(" "))
                  }
                >
                  <Copy />
                </button>
              </td>
            </tr>
          ) : null}
          <tr>
            <td>
              <p className="font-semibold">Image Url:</p>
            </td>
            <td>
              <p>{album.cover_image}</p>
            </td>
            <td>
              <button onClick={() => copyContent(album.cover_image)}>
                <Copy />
              </button>
            </td>
          </tr>
          <tr>
            <td>
              <p className="font-semibold">Embed Url:</p>
            </td>
          </tr>
        </table>
      </div>
    </article>
  );
};

export default AlbumCard;

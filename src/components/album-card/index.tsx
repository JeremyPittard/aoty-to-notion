import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import { Copy } from "lucide-react";

type AlbumCardProps = {
  album: SimplifiedAlbum;
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
  return (
    <article className="album-card flex p-4">
      <img
        src={album.images[0].url}
        alt=""
        height={144}
        width={144}
        onClick={() => copyContent(album.images[0].url)}
        className="cursor-pointer self-start"
        loading="lazy"
      />
      <div className="details px-2 pb-2">
        <h2 className="font-bold flex items-center">
          {`${album.artists[0].name} - ${album.name}`}{" "}
          <button
            className="ml-3"
            onClick={() =>
              copyContent(`${album.artists[0].name} - ${album.name}`)
            }
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
              <p>{album.artists.map((artist) => artist.name)}</p>
            </td>
            <td>
              <button
                onClick={() =>
                  copyContent(
                    album.artists.map((artist) => artist.name).join(" ")
                  )
                }
              >
                <Copy />
              </button>
            </td>
          </tr>
          <tr>
            <td>
              <p className="font-semibold">Album Name:</p>
            </td>
            <td>
              <p>{album.name}</p>
            </td>
            <td>
              <button onClick={() => copyContent(album.name)}>
                <Copy />
              </button>
            </td>
          </tr>

          {/* currently does not return anything from spotify, they don't plan on fixing it soon so included just incase it ever starts working and I don't have to constantly check */}
          {album.genres ? (
            <tr>
              <td>
                <p className="font-semibold">Genres:</p>
              </td>
              <td>{album.genres.map((genre) => genre)}</td>
              <td>
                <button
                  onClick={() =>
                    copyContent(album.genres.map((genre) => genre).join(" "))
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
              <p>{album.images[0].url}</p>
            </td>
            <td>
              <button onClick={() => copyContent(album.images[0].url)}>
                <Copy />
              </button>
            </td>
          </tr>
          <tr>
            <td>
              <p className="font-semibold">Embed Url:</p>
            </td>
            <td>
              <p>{album.external_urls.spotify}</p>
            </td>
            <td>
              <button onClick={() => copyContent(album.external_urls.spotify)}>
                <Copy />
              </button>
            </td>
          </tr>
        </table>
      </div>
    </article>
  );
};

export default AlbumCard;

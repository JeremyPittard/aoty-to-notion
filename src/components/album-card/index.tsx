import type { DiscogsSearchResult } from "../../services/discogs";
import { sendToNotion } from "../../services/notion";

type AlbumCardProps = {
  album: DiscogsSearchResult;
};

const AlbumCard = ({ album }: AlbumCardProps) => {
  const genres = [...new Set([...album.genre, ...album.style])];
  
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
              <p>{artist || album.title}</p>
            </td>
          </tr>
          <tr>
            <td>
              <p className="font-semibold">Album Name:</p>
            </td>
            <td>
              <p>{albumTitle || album.title}</p>
            </td>
          </tr>
          {genres.length > 0 ? (
            <tr>
              <td>
                <p className="font-semibold">Genres:</p>
              </td>
              <td>{genres.join(", ")}</td>
            </tr>
          ) : null}
        </table>
        <button 
          onClick={handleSendToNotion}
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send it
        </button>
      </div>
    </article>
  );
};

export default AlbumCard;

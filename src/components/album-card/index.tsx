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
    <article className="flex overflow-hidden">
      <img
        src={album.images[0].url}
        alt=""
        height={144}
        width={144}
        onClick={() => copyContent(album.images[0].url)}
        className="cursor-pointer max-w-36"
      />
      <div className="details p-2">
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
        <ul className="text-gray-800 overflow-hidden ">
          <li className="flex items-center">
            {album.artists.map((artist) => artist.name)}
            <button
              className="ml-3"
              onClick={() =>
                copyContent(
                  album.artists.map((artist) => artist.name).join(" ")
                )
              }
            >
              <Copy />
            </button>
          </li>
          <li className="flex items-center">
            {album.name}
            <button className="ml-3" onClick={() => copyContent(album.name)}>
              <Copy />
            </button>
          </li>
          {/*  currently does not work because spotify is lazy. adding this in the hope it gets fixed without me having to constantly check */}
          {album.genres ? (
            <li className="flex items-center">
              {album.genres.map((genre) => genre)}
              <button className="ml-3" onClick={() => copyContent(album.name)}>
                <Copy />
              </button>
            </li>
          ) : null}
          <li className="flex items-center">
            {album.images[0].url}
            <button
              className="ml-3"
              onClick={() => copyContent(album.images[0].url)}
            >
              <Copy />
            </button>
          </li>
          <li className="flex items-center">
            {album.external_urls.spotify}
            <button
              className="ml-3"
              onClick={() => copyContent(album.external_urls.spotify)}
            >
              <Copy />
            </button>
          </li>
        </ul>
      </div>
    </article>
  );
};

export default AlbumCard;

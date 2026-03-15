import type { StandardAlbum } from "../types/album";

export const sendToNotion = async (album: StandardAlbum) => {
  // Combine genre array into comma-separated string
  const genres = album.genre?.join(", ") || "Unknown";

  const data = {
    cover: {
      type: "external",
      external: {
        url: album.coverImage,
      },
    },
    properties: {
      Status: {
        status: {
          name: "Queue",
        },
      },
      Artist: {
        rich_text: [
          {
            text: {
              content: album.artist,
            },
          },
        ],
      },
      Title: {
        rich_text: [
          {
            text: {
              content: album.title,
            },
          },
        ],
      },
      Genre: {
        rich_text: [
          {
            text: {
              content: genres,
            },
          },
        ],
      },
      tags: {
        rich_text: [
          {
            text: {
              content: album.year || "",
            },
          },
        ],
      },
    },
  };

  try {
    // Use Astro server endpoint to bypass CORS
    const response = await fetch("/api/notion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion API error:", errorData);
      throw new Error(
        `Failed to send to Notion: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("Successfully sent to Notion:", result);
    return result;
  } catch (error) {
    console.error("Error sending to Notion:", error);
    throw error;
  }
};

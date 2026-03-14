export const sendToNotion = async (album: any) => {
  const { title, genre, style, year, cover_image } = album;

  // Split title into artist and album name
  // Assuming format: "Artist - Album"
  const [artist, albumTitle] = title.split(" - ");

  // Combine genre and style for comma-separated genre string
  const genres = [...new Set([...genre, ...style])].join(", ");

  const data = {
    cover: {
      type: "external",
      external: {
        url: cover_image,
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
              content: artist || title,
            },
          },
        ],
      },
      Title: {
        rich_text: [
          {
            text: {
              content: albumTitle || title,
            },
          },
        ],
      },
      Genre: {
        rich_text: [
          {
            text: {
              content: genres || "Unknown",
            },
          },
        ],
      },
      tags: {
        rich_text: [
          {
            text: {
              content: year || "",
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
        `Failed to send to Notion: ${response.status} ${response.statusText}`,
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

export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Add parent with database_id on the server side
    const notionData = {
      ...data,
      parent: {
        database_id: import.meta.env.NOTION_DB_ID,
      },
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(notionData),
    });

    const responseText = await response.text();

    if (!responseText || responseText.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "Empty response from Notion",
          status: response.status,
          message: "Notion API returned an empty response",
        }),
        {
          status: response.status || 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON response",
          message: "Failed to parse Notion API response",
        }),
        {
          status: response.status || 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: result,
          message: "Failed to send to Notion",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("API endpoint error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to send to Notion",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

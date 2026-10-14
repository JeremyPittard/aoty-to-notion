export const prerender = false;

import type { APIRoute } from "astro";

type NotionText = {
  plain_text?: string;
  text?: { content?: string };
};

type NotionProperty = {
  title?: NotionText[];
  rich_text?: NotionText[];
  status?: { name?: string } | null;
  select?: { name?: string } | null;
};

type NotionPage = {
  properties?: Record<string, NotionProperty>;
};

type NotionQueryResult = {
  results?: NotionPage[];
  has_more?: boolean;
  next_cursor?: string | null;
};

const getPropertyText = (property?: NotionProperty) => {
  const text = property?.title ?? property?.rich_text ?? [];
  return text
    .map((item) => item.plain_text ?? item.text?.content ?? "")
    .join("")
    .trim();
};

const escapeMarkdown = (value: string) =>
  value
    .replace(/[\r\n]+/g, " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("*", "\\*")
    .replaceAll("_", "\\_")
    .replaceAll("`", "\\`")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]");

export const GET: APIRoute = async () => {
  try {
    const pages: NotionPage[] = [];
    let startCursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${import.meta.env.NOTION_DB_ID}/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.NOTION_TOKEN}`,
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({
            page_size: 100,
            ...(startCursor ? { start_cursor: startCursor } : {}),
          }),
        },
      );

      const responseText = await response.text();
      let result: NotionQueryResult & { message?: string };

      try {
        result = JSON.parse(responseText) as NotionQueryResult & {
          message?: string;
        };
      } catch {
        throw new Error("Notion returned an invalid response.");
      }

      if (!response.ok) {
        console.error("Notion export query failed:", result);
        return new Response(
          JSON.stringify({
            error: result.message ?? "Failed to read the Notion database.",
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      pages.push(...(result.results ?? []));
      hasMore = result.has_more === true;
      startCursor = result.next_cursor ?? undefined;

      if (hasMore && !startCursor) {
        throw new Error("Notion returned an incomplete pagination response.");
      }
    }

    const columns = new Map<string, string[]>();

    for (const page of pages) {
      const properties = page.properties ?? {};
      const status = properties.Status;
      const column =
        status?.status?.name ||
        status?.select?.name ||
        getPropertyText(status) ||
        "No status";
      const artist = escapeMarkdown(getPropertyText(properties.Artist));
      const title = escapeMarkdown(
        getPropertyText(properties.Title) || getPropertyText(properties.Name),
      );
      const genre = escapeMarkdown(getPropertyText(properties.Genre));

      if (!artist && !title) continue;

      const albums = columns.get(column) ?? [];
      const album = `- ${artist ? `${artist} - ` : ""}${title}${genre ? ` (Genre: ${genre})` : ""}`;
      albums.push(album);
      columns.set(column, albums);
    }

    const markdown = [
      "# Album Collection",
      ...Array.from(columns, ([column, albums]) =>
        [`\n## ${escapeMarkdown(column)}`, ...albums].join("\n"),
      ),
    ].join("\n");

    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": 'attachment; filename="aoty-albums.md"',
      },
    });
  } catch (error) {
    console.error("Notion export failed:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to export the Notion database.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
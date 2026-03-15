/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly NOTION_TOKEN: string;
  readonly NOTION_DB_ID: string;
  readonly DISCOGS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
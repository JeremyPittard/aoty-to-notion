/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly NOTION_TOKEN: string;
  readonly NOTION_DB_ID: string;
  readonly PUBLIC_DISCOGS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
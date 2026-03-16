# AOTY Fetch

A tool built with Astro and React to reduce the manual work needed to populate the queue in my listening list hosted on Notion. [Check it out here.](https://icy-libra-d87.notion.site/AOTY-67d5cdca1c004349a1792d79fcb6d92d?pvs=74)

## Features

- **Dual API Search**: Search for albums on both Discogs and Last.fm
- **Standardized Results**: Results from all APIs are normalized into a common format
- **Advanced Filtering**: Filter search results by API source
- **Pagination**: Navigate through large sets of results
- **Notion Integration**: Send albums directly to Notion database
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Smooth skeleton loading animations

## Usage

### Prerequisites

1. Node.js (v18 or later)
2. pnpm (or npm/yarn)
3. API keys from Discogs, Last.fm, and Notion

### Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd aoty-fetch
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Create and configure environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your API keys:

   - **Notion**: Obtain from [Notion Integrations](https://www.notion.com/my-integrations)
   - **Discogs**: Obtain from [Discogs Developers](https://www.discogs.com/settings/developers)
   - **Last.fm**: Obtain from [Last.fm API](https://www.last.fm/api/account/create)

4. **Duplicate Notion template**:

   - Go to [AOTY Notion Template](https://icy-libra-d87.notion.site/AOTY-67d5cdca1c004349a1792d79fcb6d92d?pvs=74)
   - Click "Duplicate" to create your own copy

5. **Run the application**:
   ```bash
   pnpm dev
   ```

### Searching for Albums

1. Enter an album title (and optionally artist name) into the search input
2. Select which APIs to search (Discogs, Last.fm, or both)
3. Choose how many results to display per page (10, 20, 50, or 100)
4. Click "Search" to find albums
5. Navigate through pages using the pagination controls

### Sending to Notion

1. Find an album you want to add to your Notion list
2. Click the "Send It!" button on the album card
3. The album will be automatically added to your Notion database

## API Integration

### Discogs API

- **Endpoint**: `/api/discogs`
- **Features**: Search for master releases, get detailed album information, including genres and styles
- **Rate Limits**: Discogs rate limits apply

### Last.fm API

- **Endpoint**: `/api/lastfm`
- **Features**: Search for albums, get album artwork and basic information
- **Rate Limits**: 500 calls per minute

### Combined Search

- **Endpoint**: `/api/search`
- **Features**: Search both APIs in parallel, normalize results, deduplicate results

## Project Structure

```
src/
├── components/          # React components
│   ├── fetcher/        # Search form with filters and pagination
│   │   └── index.tsx
│   └── album-card/     # Album details card
│       └── index.tsx
├── services/           # API service layer
│   ├── discogs.ts      # Discogs API types
│   ├── lastfm.ts       # Last.fm API types
│   ├── album-normalizer.ts  # Result normalization logic
│   └── notion.ts       # Notion API integration
├── types/              # TypeScript type definitions
│   └── album.ts        # Standardized album interface
├── pages/              # Astro pages
│   ├── api/            # API endpoints
│   │   ├── discogs.ts
│   │   ├── lastfm.ts
│   │   └── search.ts
│   └── index.astro     # Main entry point
└── env.d.ts            # Environment type definitions
```

## Technology Stack

- **Framework**: Astro 5.0.9 with React integration
- **UI**: Tailwind CSS 3.4.3 with @tailwindcss/forms plugin
- **API**: Discogs API, Last.fm API, Notion API
- **Language**: TypeScript 5.4.5
- **Package Manager**: pnpm 9.4.0

## Todo

- [ ] Make it look better, AI didn't do the best job after I used it to update the APIs
- [ ] Improved search filtering (by genre, year)
- [ ] Enhanced album details view
- [ ] Batch operations (send multiple albums at once)
- [ ] User preferences and settings
- [ ] Performance optimizations

## Contributing

Feel free to submit issues and pull requests!

## License

MIT

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/medium.svg)](https://astro.build)

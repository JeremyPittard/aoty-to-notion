# AOTY Fetch Codebase Guide for Agents

## Overview

This is a small Astro + React application that fetches album information from Spotify API and provides copy-paste functionality for populating a Notion listening list. The app allows users to search for albums, view details, and copy information to their clipboard.

## Build/Lint/Test Commands

### Core Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production (includes TypeScript check)
pnpm build

# Preview production build
pnpm preview

# Run Astro CLI commands directly
pnpm astro [command]
```

### Type Checking

The project uses TypeScript with strict rules (extends `astro/tsconfigs/strict`). Type checking happens automatically during build:

```bash
# Run Astro check separately
pnpm astro check
```

### Linting & Formatting

There are no explicit linting/formatting scripts configured. However, you should:

1. Follow the existing code style (see guidelines below)
2. Use TypeScript for all new code
3. Ensure builds pass (`pnpm build`)
4. Verify the dev server runs without errors (`pnpm dev`)

### Testing

Currently, there are no automated tests configured. To test changes:

1. DO NOT start a server.
2. Ask the user to verify

## Code Structure

```
src/
├── components/          # React components
│   ├── fetcher/        # Search form component
│   │   └── index.tsx
│   └── album-card/     # Album details card
│       └── index.tsx
├── services/           # API service layer
│   └── discogs.ts      # Discogs API integration
├── pages/              # Astro pages
│   └── index.astro     # Main entry point
├── layouts/            # Astro layouts
│   └── Layout.astro    # Base layout
└── env.d.ts            # Environment type definitions
```

## Technology Stack

- **Framework**: Astro 5.0.9 with React integration
- **UI**: Tailwind CSS 3.4.3 with @tailwindcss/forms plugin
- **API**: Spotify Web API (via @spotify/web-api-ts-sdk)
- **Icons**: Lucide React
- **Language**: TypeScript 5.4.5
- **Package Manager**: pnpm 9.4.0

## Code Style Guidelines

### Imports

1. **Order imports consistently**:
   - External libraries first
   - Internal modules/components
   - Type imports (using `type` keyword)

```typescript
// Good
import { useState, type FormEvent } from "react";
import { getAlbums } from "../../services/spotify";
import AlbumCard from "../album-card";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
```

### Naming Conventions

1. **Variables/Properties**: camelCase

   ```typescript
   const albumTitle = "...";
   const isLoading = false;
   ```

2. **Functions/Methods**: camelCase

   ```typescript
   const getAlbums = async () => { ... }
   const copyContent = async () => { ... }
   ```

3. **Components**: PascalCase (both file/folder names and component names)

   ```typescript
   // File: src/components/album-card/index.tsx
   const AlbumCard = () => { ... }
   ```

4. **Types/Interfaces**: PascalCase, with optional `I` prefix for interfaces (or `type` for type aliases)

   ```typescript
   type AlbumCardProps = { ... }
   type albumTitle = string
   ```

5. **File/Folder Structure**: kebab-case for folders, `index.tsx` for main component files
   ```
   src/components/album-card/index.tsx
   ```

### Type Safety

1. **Use TypeScript for all files**: `.ts` for services, `.tsx` for React components, `.astro` for Astro files
2. **Type all function parameters and return types**:

   ```typescript
   export const getAlbums = async (albumTitle: albumTitle): Promise<SimplifiedAlbum[]> => { ... }
   ```

3. **Type component props explicitly**:

   ```typescript
   type AlbumCardProps = {
     album: SimplifiedAlbum;
   };

   const AlbumCard = ({ album }: AlbumCardProps) => { ... }
   ```

4. **Use type aliases for complex types**:
   ```typescript
   type albumTitle = string;
   ```

### Error Handling

1. **Use try-catch blocks for async operations**:

   ```typescript
   try {
     await navigator.clipboard.writeText(string);
   } catch (err) {
     console.error("Failed to copy: ", err);
   }
   ```

2. **Log errors to console for debugging**:
   ```typescript
   console.error("Failed to copy: ", err);
   ```

### React Component Style

1. **Use function components with hooks**:

   ```typescript
   import { useState } from "react";

   const FetchForm = () => {
     const [albumTitle, setAlbumTitle] = useState<string>("");
     // ...
   };
   ```

2. **Event handlers**: camelCase, with `handle` prefix

   ```typescript
   const handleSubmit = async (event: FormEvent) => { ... }
   ```

3. **Destructure props**:

   ```typescript
   const AlbumCard = ({ album }: AlbumCardProps) => { ... }
   ```

4. **Key prop in lists**: Always use stable, unique keys
   ```typescript
   {
     albums?.map((album: SimplifiedAlbum) => (
       <AlbumCard album={album} key={album.id} />
     ));
   }
   ```

### Astro File Style

1. **Use `.astro` files for page/layout components**:

   - Frontmatter between `---`
   - Component template below
   - Import React components directly

2. **Example structure**:

   ```astro
   ---
   import Layout from '../layouts/Layout.astro';
   import FetchForm from '../components/fetcher/index';
   ---

   <Layout title="AOTY">
     <main>
       <h1>AOTY</h1>
       <FetchForm />
     </main>
   </Layout>
   ```

### Styling

1. **Use Tailwind CSS utility classes**:

   ```tsx
   <section className="max-w-lg mx-auto">
     <form className="p-4">
       <div className="flex flex-col">{/* content */}</div>
     </form>
   </section>
   ```

2. **Responsive design**: Use Tailwind's responsive prefixes if needed
3. **Custom styles**: Add to `src/styles/` folder if necessary (not currently used)

### API Integration

1. **Service layer pattern**: Wrap API calls in service functions (see `src/services/spotify.ts`)
2. **Environment variables**: Use `import.meta.env.PUBLIC_*` for public variables

   - Define in `.env` file
   - Type in `src/env.d.ts`

3. **Example API service**:

   ```typescript
   import { SpotifyApi, type SimplifiedAlbum } from "@spotify/web-api-ts-sdk";

   const spotify = SpotifyApi.withClientCredentials(
     import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID,
     import.meta.env.PUBLIC_SPOTIFY_CLIENT_SECRET,
   );

   export const getAlbums = async (albumTitle: albumTitle) => {
     const albums: SimplifiedAlbum[] = (
       await spotify.search(albumTitle, ["album"], "AU", 50)
     ).albums.items;
     return albums;
   };
   ```

### Performance Considerations

1. **Image loading**: Use `loading="lazy"` for images

   ```tsx
   <img src={url} loading="lazy" />
   ```

2. **State management**: Keep state localized to components that need it
3. **Search optimization**: The current implementation searches with a limit of 50 results

## Environment Variables

Required variables (create a `.env` file in root):

```bash
PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

## Best Practices

1. **Keep components focused**: Each component should have a single responsibility
2. **Document complex logic**: Use comments for non-obvious code
3. **Avoid direct DOM manipulation**: Use React state and props
4. **Handle loading states**: Show feedback when fetching data
5. **Error handling**: Provide feedback or fallback UI when operations fail
6. **Accessibility**: Follow basic accessibility guidelines (alt text for images, semantic HTML)

## Future Enhancements

The TODO list includes:

- Proper design improvements
- Integration with Notion API to send data directly
- Performance optimizations

## Debugging Tips

1. **Check browser console**: For errors and console.log messages
2. **Network tab**: Inspect API calls to Spotify
3. **Astro dev server**: Provides error messages in terminal and browser
4. **TypeScript errors**: Run `pnpm astro check` to see type issues

---

This guide is designed to help agents understand the codebase structure, style, and best practices. Always follow the existing patterns and ensure your changes maintain compatibility with the current architecture.

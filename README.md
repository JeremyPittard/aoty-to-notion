# AOTY -> Notion (eventually)

A tool built with Astro and React to reduce the manual work needed to populate the queue in my listening list hosted on notion. [you check it out here.](https://icy-libra-d87.notion.site/AOTY-67d5cdca1c004349a1792d79fcb6d92d?pvs=74)

## Usage

at this stage I am not going to publicly host this but you can clone and run your own version like so.

1. grab a client ID and Secret from spotivy
2. create a .env in root and add the values to

- PUBLIC_SPOTIFY_CLIENT_ID
- PUBLIC_SPOTIFY_CLIENT_SECRET

3. Duplicate [this notion template](https://icy-libra-d87.notion.site/AOTY-67d5cdca1c004349a1792d79fcb6d92d?pvs=74)
4. `pnpm install `
   \

you should now be able to spin it up using

```bash
pnpm dev
```

to grab the info type an album title (and band if you wish) to the text input, hit "Go!" and you will be presented a list of albums, select the one you wish to send off to notion and it will then provide you with easy copy and paste deets to manually chuck it in(coming soon...).

Eventually this will have a button to hit send and it will post straight to notion.

## Todo

- [ ] Proper Design
- [x] present album details with copy buttons for each piece of info
- [ ] hook it up to send straight to notion
- [ ] optimisations (low priority due to only needing to run locally)

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/medium.svg)](https://astro.build)

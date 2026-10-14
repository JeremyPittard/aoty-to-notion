/** @type {import('tailwindcss').Config} */

import forms from "@tailwindcss/forms";
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        palette: {
          ink: "var(--palette-ink)",
          surface: "var(--palette-surface)",
          raised: "var(--palette-raised)",
          paper: "var(--palette-paper)",
          muted: "var(--palette-muted)",
          line: "var(--palette-line)",
          highlight: "var(--palette-highlight)",
          gray: "var(--palette-gray)",
        },
      },
    },
  },
  plugins: [forms],
};

# MarkdownScribe brand assets

Generated copy. Do not edit here: the source lives in the private repository and is synced with `pnpm brand:sync`.

## The name

Write it as `MarkdownScribe`: one word, capital M, capital S. Not "Markdown Scribe", not "MDScribe". Package and command names stay as they are (`markdownscribe` on npm, `mdscribe` as the CLI binary, `@markdownscribe/sdk`); in prose, the product is `MarkdownScribe`.

## The mark

A `#` whose last stroke ends in a pen nib. Use the files below as they are.

| File | Use it for |
|---|---|
| `logo/symbol-light.svg` | the mark alone on a light background |
| `logo/symbol-dark.svg` | the mark alone on a dark background |
| `logo/lockup-light.svg` | mark and name on a light background (the default) |
| `logo/lockup-dark.svg` | mark and name on a dark background |
| `logo/*-mono.svg`, `logo/*-mono-inverse.svg` | one-colour contexts: print, PDF, stamps |
| `logo/tile.svg` | icons and avatars (favicon, app icon, GitHub, npm, MCP) |

Keep clear space of twice the stroke width on all sides. Minimum size: 16 px for the mark, 120 px wide for the lockup. Do not rotate, stretch, outline, recolour, add gradients or shadows, separate the nib from the hash, or put the mark inside a circle.

## Tokens

`tokens.css` exposes every colour, font and size as `--ms-*` custom properties, with dark mode under `[data-theme="dark"]` and `prefers-color-scheme`. `tokens.json` is the same data for scripts. Site and docs read these; no brand colour is typed anywhere else.

## Fonts

Atkinson Hyperlegible Next (text) and JetBrains Mono (code), self-hosted from `fonts/`. Both are distributed under the SIL Open Font License.

## Favicon and social image

`favicon/head.html` has the exact `<link>` tags for the `<head>`. `favicon/site.webmanifest` is the web app manifest. `og/og-default.png` is the default social preview (1200 × 630).

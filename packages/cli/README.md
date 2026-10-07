# markdownscribe (CLI)

Command-line interface for [MarkdownScribe](https://api.markdownscribe.com) — frontmatter, table of contents, lint, format, Mermaid-to-SVG, and URL-to-Markdown, from your terminal or from a shell script/agent runner. Built on top of [`@markdownscribe/sdk`](https://github.com/getmarkdownscribe/markdownscribe/tree/main/packages/sdk#readme).

Get an API key at [dashboard.markdownscribe.com](https://dashboard.markdownscribe.com/).

## Install

```bash
npm install -g markdownscribe
```

Installs two equivalent binaries: `markdownscribe` and the shorter `mdscribe`.

## Authentication

Resolved in this order: `MDSCRIBE_API_KEY` env var → a `.env` file (`MDSCRIBE_API_KEY=...`) in the current directory.

API base URL, in order of precedence: `--base-url <url>` flag → `MDSCRIBE_URL` env var → `https://api.markdownscribe.com` (the default; you normally never set this).

## Commands

```bash
mdscribe frontmatter <path>                     # file or directory (non-recursive)
mdscribe toc <path> [--min-depth N] [--max-depth N]
mdscribe format <path> [--prose-wrap preserve|always|never] [--write] [--check]
mdscribe lint <path>
mdscribe mermaid <path>                          # single .mmd or .md/.mdx file, writes <name>-diagram-N.svg
mdscribe url <url> [--mode clean|raw] [--save <path>]
```

`frontmatter`/`toc`/`format`/`lint` accept a single file or a directory (non-recursive: only `.md`/`.mdx` files directly in it). `mermaid` and `url` take a single file / a single URL. Every successful run prints the credits charged for that call. Files written to disk (`format --write`, `mermaid`'s SVGs, `url --save`) are UTF-8 without a BOM.

## Exit codes

| Code | Meaning                                    |
| ---- | ------------------------------------------ |
| 0    | Success                                    |
| 1    | Generic/config error                       |
| 2    | Authentication failed (401)                |
| 3    | Insufficient credits (402)                 |
| 4    | Rate limited (429)                         |
| 5    | Invalid request (400/413/422)              |
| 6    | Upstream service unavailable (503/504/424) |
| 7    | Not found (404)                            |

Scriptable by design: every failure mode maps to a distinct, documented exit code. Error messages on stderr end with the call's `request_id` — quote it in a [bug report](https://github.com/getmarkdownscribe/markdownscribe/issues/new?template=bug.yml).

## Scope

Covers the 6 REST markdown operations. Source, issues and changelog: [github.com/getmarkdownscribe/markdownscribe](https://github.com/getmarkdownscribe/markdownscribe).

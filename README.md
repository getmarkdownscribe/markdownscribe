# MarkdownScribe

MarkdownScribe does the Markdown work in one API call: parse frontmatter, build a TOC, lint, format, render Mermaid to SVG, convert any URL to Markdown. Pay per credit.

This repository holds the open-source clients for the [MarkdownScribe API](https://api.markdownscribe.com/):

| Package                        | npm                                                                        | What it is                                                                  |
| ------------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`packages/cli`](packages/cli) | [`markdownscribe`](https://www.npmjs.com/package/markdownscribe)           | Command-line tool (`mdscribe`) for terminals, scripts, CI and coding agents |
| [`packages/sdk`](packages/sdk) | [`@markdownscribe/sdk`](https://www.npmjs.com/package/@markdownscribe/sdk) | Typed TypeScript client for Node.js 22+                                     |

The API itself is a hosted service; its contract is public at [`api.markdownscribe.com/openapi.json`](https://api.markdownscribe.com/openapi.json) (OpenAPI 3.1).

## Get started

1. Get an API key at [dashboard.markdownscribe.com](https://dashboard.markdownscribe.com/). New accounts start with free credits.
2. Put it in the environment:

   ```bash
   export MDSCRIBE_API_KEY=mdsk_...
   ```

3. Run an operation:

   ```bash
   npx markdownscribe frontmatter post.md
   ```

   Or from code:

   ```ts
   import { MarkdownScribeClient } from "@markdownscribe/sdk";

   const client = new MarkdownScribeClient({ apiKey: process.env.MDSCRIBE_API_KEY! });
   const { frontmatter, meta } = await client.frontmatter({ markdown: "---\ntitle: Hi\n---\n" });
   console.log(frontmatter, meta.credits, meta.creditsRemaining);
   ```

## Operations and credits

| Operation                 | CLI                    | SDK             | Credits                                               |
| ------------------------- | ---------------------- | --------------- | ----------------------------------------------------- |
| Parse frontmatter         | `mdscribe frontmatter` | `frontmatter()` | 1                                                     |
| Build a table of contents | `mdscribe toc`         | `toc()`         | 1                                                     |
| Lint                      | `mdscribe lint`        | `lint()`        | 2                                                     |
| Format                    | `mdscribe format`      | `format()`      | 2                                                     |
| Render Mermaid to SVG     | `mdscribe mermaid`     | `mermaid()`     | 5 for the first diagram, 2 for each extra one         |
| Convert a URL to Markdown | `mdscribe url`         | `urlToMd()`     | 2 to 8, depending on whether the page needs a browser |

Every response reports what it charged (`X-Credits-Charged`) and the balance left (`X-Credits-Remaining`). The SDK exposes both in `meta`.

## Errors

Every error carries a `request_id`, a `hint` and, when there is one, a `next_step`. Quote the `request_id` when you [open an issue](https://github.com/getmarkdownscribe/markdownscribe/issues/new/choose): it is how we find your call in our logs.

## Development

```bash
pnpm install
pnpm build
pnpm test
```

Tests that call the real API run only when `MDSCRIBE_API_KEY` is set and spend a few credits from that key. Without it they are skipped with a warning. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE). Contact: <support@markdownscribe.com>. Security reports: see [SECURITY.md](SECURITY.md).

---
title: URL to Markdown
description: "Turn a web page into Markdown with one API call. Pages that need JavaScript are rendered in a headless browser on our side."
---

## What it is

One call that takes a URL and returns the page's content as Markdown, with the title, author and publication date when the page declares them.

## When to use it

- **Your agent's cue:** the task needs what a web page says (documentation, an article, a changelog, a help center) as text it can read, quote or store.
- **You'll reach for it when** you paste a link into your agent and want it to work from the content, not from the menus, cookie banners and footers around it.

## A real use case

You are building a support assistant in Lovable for a product whose help center lives on another site. A backend function sends each help-center URL to MarkdownScribe and stores the Markdown it gets back; the assistant answers from those files. Some of those pages are JavaScript apps that show nothing without a browser. The same call renders them, and your function does not change.

## Why through the API

- **No browser to install or keep running.** Pages that need JavaScript are rendered in a headless browser on our side. Your agent only makes an HTTP call.
- **You pay for the route the page needed.** `clean` first looks for an official `.md` version of the page, then tries a plain fetch, and opens the browser only if those fail. The response says which route was taken and what it cost.
- **Failures you can branch on.** A page that can't be reached, a page with no content and a page that is too slow come back as different error codes, each with a `hint` and a link to its page here.

## Copy-ready example

<!-- generated:example convertUrlToMarkdown -->

### curl

```bash
curl https://api.markdownscribe.com/v1/url-to-md \
  -H "X-API-Key: $MDSCRIBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://commonmark.org/help/"}'
```

### TypeScript SDK

```ts
import { MarkdownScribeClient } from "@markdownscribe/sdk";

const client = new MarkdownScribeClient({ apiKey: process.env.MDSCRIBE_API_KEY! });
const result = await client.urlToMd({
  url: "https://commonmark.org/help/",
});
```

### CLI

```bash
mdscribe url https://commonmark.org/help/
```

### Response

Captured from the API on 2026-10-13. `markdown` is cut after the first lines here; the full value is about 1,800 characters.

```json
{
  "markdown": "**Markdown** is a simple way to format text that looks great on any device. It doesn’t do anything fancy like change the font size, color, or type — just the essentials, using keyboard symbols you already know.\n[Try Our 10 Minute Markdown Tutorial](https://commonmark.org/help/tutorial/)  \n| Type  | Or  | … to Get  |  \n| --- | --- | --- |  \n| *Italic*  | _Italic_  | _Italic_  |  \n…",
  "mode": "clean",
  "metadata": {
    "title": "Markdown Reference",
    "author": null,
    "published_date": null,
    "used_playwright": false,
    "extraction_quality": "raw_fallback"
  },
  "meta": {
    "request_id": "01M4TVNEKMY7Y4EQ0E4K2F4FN6",
    "duration_ms": 692,
    "credits": 3
  }
}
```

<!-- /generated:example -->

`metadata.extraction_quality` tells you what you got:

| Value | Meaning |
| --- | --- |
| `llms_md` | The site publishes its own `.md` version of the page, and that is what came back. |
| `clean` | The main content, without navigation and footers. |
| `raw_fallback` | The main-content pass found too little text, so you got the text of the whole page. |
| `raw` | You asked for `mode: "raw"`: the whole page as the browser rendered it. |

## Credits, limits and errors

<!-- generated:credits convertUrlToMarkdown -->

**3 to 8 credits per call.** 3 for `clean` when an official .md file or a static fetch is enough; 8 when the page needed the headless browser. `raw` always uses the browser, so it always costs 8. Check `metadata.used_playwright` and the X-Credits-Charged header. Errors are never charged.

<!-- /generated:credits -->

- **Modes:** `clean` (the default) returns the main content; `raw` returns the whole rendered page and always goes through the browser.
- **Time limit:** the call gives up after 30 seconds of loading the page.
- **Rate limit:** URL to Markdown and Mermaid share a lower per-minute limit than the other operations, because both run a browser.

| Error | When |
| --- | --- |
| [`invalid_request`](/errors/invalid_request/) | `url` is missing, is not a valid URL, or `mode` is not `clean` or `raw`. |
| [`fetch_failed`](/errors/fetch_failed/) | The page could not be reached, or answered with an error status (`upstream_status` says which). |
| [`extraction_empty`](/errors/extraction_empty/) | `clean` found too little text to call it content. `raw` returns the page anyway. |
| [`timeout`](/errors/timeout/) | The page took longer than 30 seconds to load. |
| [`service_unavailable`](/errors/service_unavailable/) | Our rendering service is down. Retry in a moment. |
| [`unauthorized`](/errors/unauthorized/), [`insufficient_credits`](/errors/insufficient_credits/), [`rate_limited`](/errors/rate_limited/) | The key, the balance or the per-minute limit, as on every operation. |

## Alternatives, and when MarkdownScribe is worth it

Checked on 2026-10-13 against each tool's own documentation.

- **Jina Reader.** Put `https://r.jina.ai/` in front of a URL and you get Markdown back, rendered in a headless browser. It works without a key at a low rate limit ([jina.ai/reader](https://jina.ai/reader/)). Use MarkdownScribe when the same agent also lints, formats or renders Mermaid: one key, one balance and one error format for all of it.
- **Firecrawl.** `POST https://api.firecrawl.dev/v2/scrape` with `formats: ["markdown"]`, 1 Firecrawl credit per page ([docs.firecrawl.dev](https://docs.firecrawl.dev/features/scrape)). It also crawls whole sites and extracts structured JSON, which MarkdownScribe does not. Use MarkdownScribe for the same reason as above, when the rest of your Markdown work runs through it.

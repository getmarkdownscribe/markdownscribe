---
title: extraction_empty
description: "HTTP 422. URL to Markdown reached the page but found no main content in it. Try mode raw, or check that the page is public."
---

**HTTP status:** 422 Unprocessable Content · **Charged:** no

## What it means

`POST /v1/url-to-md` reached the page, but in `clean` mode it could not find main content to keep. The page may be empty, may show its content only after a login, or may use a layout the extractor does not recognize. `kind` is `no_content_found`.

## What to do

1. Open the URL in a private browser window. If you need to sign in to see the content, the API cannot see it either.
2. Call again with `"mode": "raw"`: it returns the whole page as Markdown instead of trying to isolate the main content.
3. If the page is public and `raw` still comes back empty, report it with the `request_id`.

## Example response

The shape below comes from the API source. The values are illustrative, because which public pages trigger this error changes over time.

```json
{
  "error": "extraction_empty",
  "hint": "We couldn't find article content on this page. It might be empty, behind a login, or use a structure we don't recognize yet. Try mode 'raw' to get the whole page instead.",
  "kind": "no_content_found",
  "docs_url": "https://docs.markdownscribe.com/errors/extraction_empty",
  "request_id": "01JEXAMPLE0000000000000000"
}
```

## Related

- [fetch_failed](/errors/fetch_failed/): the page could not be reached at all.
- [timeout](/errors/timeout/): the page took too long to load.

---
title: fetch_failed
description: "HTTP 424. URL to Markdown could not reach the page. Check that the URL is correct and online."
---

**HTTP status:** 424 Failed Dependency · **Charged:** no

## What it means

`POST /v1/url-to-md` tried to open the URL and failed: the domain does not resolve, the server did not answer, or it refused the request. The problem is on the side of the page, not of the API. When the site answered with an error status, the response includes it as `upstream_status`.

## What to do

1. Open the URL in a browser and check that it loads.
2. Check for typos in the domain.
3. Some sites block requests from data centers. If the page loads in your browser but never through the API, it is likely one of them, and there is no workaround on the API side.

## Example response

Captured from the production API on 2026-10-13, with a URL on a domain that does not exist.

```json
{
  "error": "fetch_failed",
  "hint": "We couldn't reach that URL. Check that the link is correct and still online.",
  "kind": "fetch_failed",
  "docs_url": "https://docs.markdownscribe.com/errors/fetch_failed",
  "request_id": "01M4TRDH15VF3Q9GH9A2N86AM9"
}
```

## Related

- [invalid_request](/errors/invalid_request/): the URL is not valid in the first place.
- [extraction_empty](/errors/extraction_empty/): the page loaded but had no content.
- [timeout](/errors/timeout/): the page took too long to load.

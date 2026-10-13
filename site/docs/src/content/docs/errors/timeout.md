---
title: timeout
description: "HTTP 504. The page or the diagrams took too long and the call gave up. Retry, or send less work per call."
---

**HTTP status:** 504 Gateway Timeout · **Charged:** no

## What it means

The call ran out of time before finishing:

- **URL to Markdown** gives up after 30 seconds of loading the page;
- **Mermaid** gives up after 35 seconds of rendering.

The endpoint you called tells which one it was; `kind` is `timeout` on both. As every 5xx response, it also carries a `report_url`.

## What to do

1. Retry once: slow pages are often slow only sometimes.
2. For URL to Markdown, check that the page loads in a normal browser in a few seconds.
3. For Mermaid, send fewer or simpler diagrams per call. Each diagram in the document is rendered in the same call.

## Example response

The shape below comes from the API source. The values are illustrative, because a timeout depends on a slow page at the moment of the call.

```json
{
  "error": "timeout",
  "hint": "This page took too long to load and we gave up after 30 seconds. Try again, or check that the URL loads normally in a browser.",
  "kind": "timeout",
  "docs_url": "https://docs.markdownscribe.com/errors/timeout",
  "request_id": "01JEXAMPLE0000000000000000",
  "report_url": "https://github.com/getmarkdownscribe/markdownscribe/issues/new?title=API+error+report&body=Request+ID%3A+01JEXAMPLE0000000000000000%0A%0AWhat+I+was+doing%3A%0A%0AWhat+I+expected%3A%0A"
}
```

## Related

- [fetch_failed](/errors/fetch_failed/): the page could not be reached at all.
- [service_unavailable](/errors/service_unavailable/): our rendering service is down.

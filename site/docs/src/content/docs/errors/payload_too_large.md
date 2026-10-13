---
title: payload_too_large
description: "HTTP 413. The Markdown sent is larger than 1 MB. Split the document and call again."
---

**HTTP status:** 413 Content Too Large · **Charged:** no

## What it means

The Markdown in the request is larger than the limit of 1,048,576 bytes (1 MB). The response carries the limit in `max_bytes`. The limit is in bytes, not characters: accented letters and emoji take more than one byte each.

## What to do

1. Split the document, for example at its top-level headings, and call once per part.
2. For a table of contents of a long document, send only the headings: the result is the same and the body is much smaller.

## Example response

Captured from the production API on 2026-10-13, sending 1.1 MB of Markdown to `POST /v1/md/frontmatter`.

```json
{
  "error": "payload_too_large",
  "hint": "Request markdown must be at most 1048576 bytes (1 MB). Split large documents before calling this endpoint.",
  "max_bytes": 1048576,
  "docs_url": "https://docs.markdownscribe.com/errors/payload_too_large",
  "request_id": "01M4TRDGDDBJXK1B30HQSZRK08"
}
```

## Related

- [validation](/errors/validation/): the body is the wrong shape.

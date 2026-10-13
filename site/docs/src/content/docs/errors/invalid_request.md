---
title: invalid_request
description: "HTTP 400. URL to Markdown received a body it cannot use, usually a URL without http:// or https://. How to fix it."
---

**HTTP status:** 400 Bad Request · **Charged:** no

## What it means

`POST /v1/url-to-md` could not read the request. The usual cause is a URL that is not absolute: it must start with `http://` or `https://`. A `mode` other than `clean` or `raw` returns this error too. The `kind` field is `invalid_url`.

## What to do

1. Send the full URL, scheme included: `https://example.com/page`, not `example.com/page`.
2. Send `mode` as `"clean"` (the main content of the page) or `"raw"` (the whole page).

```json
{ "url": "https://example.com/page", "mode": "clean" }
```

## Example response

Captured from the production API on 2026-10-13, sending `"url": "example.com/page"`.

```json
{
  "error": "invalid_request",
  "hint": "The URL you sent isn't valid. Make sure it starts with http:// or https:// and try again.",
  "kind": "invalid_url",
  "docs_url": "https://docs.markdownscribe.com/errors/invalid_request",
  "request_id": "01M4TRDGQ2Q2RN6S28DHB4PGY6"
}
```

## Related

- [fetch_failed](/errors/fetch_failed/): the URL is valid but could not be reached.
- [validation](/errors/validation/): the same kind of problem on the other operations.

---
title: service_unavailable
description: "HTTP 503. The service behind URL to Markdown or Mermaid is temporarily unavailable. Retry in a moment."
---

**HTTP status:** 503 Service Unavailable · **Charged:** no

## What it means

URL to Markdown and Mermaid rely on a separate service of ours, the one that runs the headless browser. It did not answer. The other four operations do not depend on it and keep working. `kind` is `extraction_service_unavailable` on URL to Markdown and `render_service_unavailable` on Mermaid.

We are alerted automatically. The response includes a `report_url`, as every 5xx does.

## What to do

1. Wait a few seconds and retry, with a growing interval between attempts.
2. If it keeps failing for minutes, open the `report_url`.

## Example response

The shape below comes from the API source. The values are illustrative, because producing this error means taking our service down.

```json
{
  "error": "service_unavailable",
  "hint": "Our extraction service is temporarily unavailable. Please try again in a moment.",
  "kind": "extraction_service_unavailable",
  "docs_url": "https://docs.markdownscribe.com/errors/service_unavailable",
  "request_id": "01JEXAMPLE0000000000000000",
  "report_url": "https://github.com/getmarkdownscribe/markdownscribe/issues/new?title=API+error+report&body=Request+ID%3A+01JEXAMPLE0000000000000000%0A%0AWhat+I+was+doing%3A%0A%0AWhat+I+expected%3A%0A"
}
```

## Related

- [timeout](/errors/timeout/): the service answered, but the page or diagram took too long.
- [internal](/errors/internal/): an unexpected error on our side.

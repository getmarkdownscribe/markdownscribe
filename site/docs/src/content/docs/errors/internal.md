---
title: internal
description: "HTTP 500. Something failed on our side. Retry once; if it persists, report it with the request_id."
---

**HTTP status:** 500 Internal Server Error · **Charged:** no

## What it means

The API hit an error it did not expect. The problem is on our side, not in your request. We are alerted automatically, and the `request_id` lets us find the exact call.

The response includes a `report_url`: a pre-filled issue on our public repository that carries only the `request_id`, never the content you sent.

## What to do

1. Retry the call once.
2. If it fails again, open the `report_url` and say what you were doing. The `request_id` is already filled in.

## Example response

The shape below comes from the API source. The values are illustrative.

```json
{
  "error": "internal",
  "hint": "An unexpected error occurred. If this persists, report the `request_id` to support.",
  "docs_url": "https://docs.markdownscribe.com/errors/internal",
  "request_id": "01JEXAMPLE0000000000000000",
  "report_url": "https://github.com/getmarkdownscribe/markdownscribe/issues/new?title=API+error+report&body=Request+ID%3A+01JEXAMPLE0000000000000000%0A%0AWhat+I+was+doing%3A%0A%0AWhat+I+expected%3A%0A"
}
```

## Related

- [service_unavailable](/errors/service_unavailable/): one of our services is temporarily down.

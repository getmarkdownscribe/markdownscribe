---
title: validation
description: "HTTP 400. The request body is not valid JSON or does not match the shape the endpoint expects. How to fix it."
---

**HTTP status:** 400 Bad Request · **Charged:** no

## What it means

The body of the request could not be used. Either it is not valid JSON, or a field is missing, has the wrong type, or is not allowed. The `details` array lists every field that failed, with its `path`, a `code` and a `message`. When the body is not JSON at all, `details` holds a single entry with code `invalid_json`.

## What to do

1. Send `Content-Type: application/json` and a well-formed JSON object.
2. Read `details`: each entry names the field (`path`) and why it failed (`message`).
3. Check the expected body for the endpoint. The four Markdown operations take `{ "markdown": "<string>" }`; Mermaid takes exactly one of `{ "diagram": "..." }` or `{ "markdown": "..." }`. The full contract is the [OpenAPI document](https://api.markdownscribe.com/openapi.json).

## Example response

Captured from the production API on 2026-10-13, calling `POST /v1/md/lint` with `{ "text": "# Hi" }` instead of `markdown`.

```json
{
  "error": "validation",
  "hint": "The request body did not match the expected shape. See `details` for each field that failed. The endpoint expects `{ \"markdown\": \"<string>\" }`.",
  "details": [
    {
      "path": ["markdown"],
      "code": "invalid_type",
      "message": "Invalid input: expected string, received undefined"
    }
  ],
  "docs_url": "https://docs.markdownscribe.com/errors/validation",
  "request_id": "01M4TRDFQJR0KEGWCTQ7EAEB4P"
}
```

## Related

- [invalid_request](/errors/invalid_request/): the same kind of problem on URL to Markdown.
- [payload_too_large](/errors/payload_too_large/): the body is valid but too big.

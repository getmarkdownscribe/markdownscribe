---
title: unauthorized
description: "HTTP 401. The request carried no valid API key, or no signed-in session on account endpoints. How to fix it."
---

**HTTP status:** 401 Unauthorized · **Charged:** no

## What it means

The API could not identify who is calling. On the six operations (`/v1/md/*` and `/v1/url-to-md`), that means the `X-API-Key` header is missing, malformed, unknown, or belongs to a revoked key. All four cases return the same body on purpose, so the response never reveals whether a key exists.

On the account endpoints (`/v1/account/*`, used by the dashboard), it means there is no signed-in session. API keys do not work there.

The response also carries the header `WWW-Authenticate: ApiKey realm="markdownscribe"`.

## What to do

1. Create a key at [dashboard.markdownscribe.com](https://dashboard.markdownscribe.com) if you do not have one. The key is shown once, when you create it.
2. Send it in the `X-API-Key` header on every call. With the CLI or the SDK, set the `MDSCRIBE_API_KEY` environment variable.
3. If the key worked before, it may have been revoked. Create a new one.

The `next_step` field suggests `mdscribe login`. That command arrives in a later CLI release; until then, use a key from the dashboard as above.

## Example response

Captured from the production API on 2026-10-13, calling `POST /v1/md/frontmatter` without a key.

```json
{
  "error": "unauthorized",
  "hint": "Send a valid API key in the X-API-Key header. If you don't have one yet, create it from the dashboard; a revoked key returns this same error.",
  "next_step": "mdscribe login",
  "docs_url": "https://docs.markdownscribe.com/errors/unauthorized",
  "request_id": "01M4TRDFFXE8P24K3A86VZ7VHZ"
}
```

## Related

- [insufficient_credits](/errors/insufficient_credits/): the key is valid but the balance is zero.
- [rate_limited](/errors/rate_limited/): the key is valid but sent too many requests.

---
title: rate_limited
description: "HTTP 429. The account sent more requests per minute than its limit allows. Wait Retry-After seconds, then retry."
---

**HTTP status:** 429 Too Many Requests · **Charged:** no

## What it means

The account went over its requests-per-minute limit. There are two counters, shared by every key of the account:

- an **overall** limit, for all calls;
- a lower **browser-backed** limit, for URL to Markdown and Mermaid, which run a headless browser.

The response says which one was hit (`op_class` is `general` or `browser`), what the limit is (`limit`), and how long to wait (`retry_after_seconds`, also sent as the `Retry-After` header).

## What to do

1. Wait the number of seconds in `Retry-After`, then retry. Retrying at once only makes the queue worse.
2. For batches, pace the calls below `limit` per minute. URL to Markdown and Mermaid have the lower limit.

## Example response

The shape below comes from the API source. The values are illustrative, because the limits are configurable.

```json
{
  "error": "rate_limited",
  "hint": "Too many requests for this account: the browser-backed limit of 10/min was exceeded. Wait 42s and retry.",
  "retry_after_seconds": 42,
  "limit": 10,
  "op_class": "browser",
  "docs_url": "https://docs.markdownscribe.com/errors/rate_limited",
  "request_id": "01JEXAMPLE0000000000000000"
}
```

The response also carries the header `Retry-After: 42`.

## Related

- [insufficient_credits](/errors/insufficient_credits/): the account is out of credits, not out of requests.

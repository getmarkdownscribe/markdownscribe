---
title: insufficient_credits
description: "HTTP 402. The account has no credits left for this call. How to add credits and keep going."
---

**HTTP status:** 402 Payment Required · **Charged:** no

## What it means

The key is valid, but the account balance is exhausted. Every call costs credits, and the balance belongs to the account, not to a single key. The response carries the current `balance` and a `pricing_url`.

Successful calls tell you the balance before you run out: read the `X-Credits-Remaining` header on every 2xx response.

## What to do

1. Add credits from the [dashboard](https://dashboard.markdownscribe.com): a one-time credit pack, or a monthly subscription. Prices are at [markdownscribe.com/pricing](https://markdownscribe.com/pricing).
2. Retry the same call. Credits are available as soon as the payment is confirmed.
3. If an agent runs without supervision, have it watch `X-Credits-Remaining` and stop before the balance reaches zero.

## Example response

The shape below comes from the API source. The values are illustrative, because producing this error on purpose means emptying a real account.

```json
{
  "error": "insufficient_credits",
  "hint": "Your credit balance is exhausted. Buy a credit pack or subscribe to keep calling the API.",
  "balance": 0,
  "pricing_url": "https://markdownscribe.com/pricing",
  "docs_url": "https://docs.markdownscribe.com/errors/insufficient_credits",
  "request_id": "01JEXAMPLE0000000000000000"
}
```

## Related

- [rate_limited](/errors/rate_limited/): the account has credits but sent too many requests.
- [unauthorized](/errors/unauthorized/): the key itself is not valid.

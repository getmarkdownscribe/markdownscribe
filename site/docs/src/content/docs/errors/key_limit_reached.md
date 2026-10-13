---
title: key_limit_reached
description: "HTTP 409. The account already has the maximum number of active API keys. Revoke one to create another."
---

**HTTP status:** 409 Conflict · **Charged:** no

## What it means

An account can hold a limited number of active API keys at the same time, and this request tried to create one more. The response says how many are active (`active`) and what the limit is (`limit`).

## What to do

1. Open the [dashboard](https://dashboard.markdownscribe.com) and revoke a key you no longer use.
2. Create the new key.

One key per place where the API is called (each project, CI pipeline or agent) makes it easy to revoke one without breaking the others.

## Example response

The shape below comes from the API source. The values are illustrative: the account endpoints need a signed-in dashboard session.

```json
{
  "error": "key_limit_reached",
  "hint": "You already have 5 active API keys, the maximum is 5. Revoke one to create another.",
  "limit": 5,
  "active": 5,
  "docs_url": "https://docs.markdownscribe.com/errors/key_limit_reached",
  "request_id": "01JEXAMPLE0000000000000000"
}
```

## Related

- [not_found](/errors/not_found/): the key you tried to revoke does not exist.

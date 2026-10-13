---
title: not_found
description: "HTTP 404. On the account endpoints, the API key you tried to revoke does not exist or is not yours. How to fix it."
---

**HTTP status:** 404 Not Found · **Charged:** no

## What it means

This code comes from the account endpoints used by the dashboard. It means the API key id in the request does not match an active key that belongs to the signed-in account. The key may have been revoked already, or the id may be wrong. A key that belongs to another account returns the same error, so the response never reveals whether an id exists.

A request to a path that does not exist at all returns a plain-text `404 Not Found`, without this body.

## What to do

1. Reload the list of keys in the [dashboard](https://dashboard.markdownscribe.com). If the key is gone, it was already revoked: nothing else to do.
2. If you are calling the account endpoints directly, check the key id you sent.
3. For an unknown path, check the endpoint name in the [OpenAPI document](https://api.markdownscribe.com/openapi.json).

## Example response

The shape below comes from the API source. The values are illustrative: the account endpoints need a signed-in dashboard session.

```json
{
  "error": "not_found",
  "hint": "No active API key with that id belongs to this account. It may have been revoked already.",
  "docs_url": "https://docs.markdownscribe.com/errors/not_found",
  "request_id": "01JEXAMPLE0000000000000000"
}
```

## Related

- [key_limit_reached](/errors/key_limit_reached/): too many active keys to create a new one.

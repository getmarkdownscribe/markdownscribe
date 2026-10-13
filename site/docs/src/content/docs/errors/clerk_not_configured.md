---
title: clerk_not_configured
description: "HTTP 503. The account endpoints are unavailable because of a configuration problem on our side. Nothing to fix on yours."
---

**HTTP status:** 503 Service Unavailable · **Charged:** no

## What it means

You should not see this code. It comes from the account endpoints used by the dashboard, and it means our sign-in configuration is missing on the server. It is a problem on our side, and you cannot fix it.

The six operations (`/v1/md/*` and `/v1/url-to-md`) do not depend on it: calls with an API key keep working.

## What to do

1. Retry in a few minutes.
2. If it persists, open the `report_url` in the response, or write to [support@markdownscribe.com](mailto:support@markdownscribe.com) with the `request_id`.

## Example response

The shape below comes from the API source. The values are illustrative.

```json
{
  "error": "clerk_not_configured",
  "hint": "Account endpoints are temporarily unavailable. This is a server-side configuration problem, not something you can fix — please retry shortly.",
  "docs_url": "https://docs.markdownscribe.com/errors/clerk_not_configured",
  "request_id": "01JEXAMPLE0000000000000000",
  "report_url": "https://github.com/getmarkdownscribe/markdownscribe/issues/new?title=API+error+report&body=Request+ID%3A+01JEXAMPLE0000000000000000%0A%0AWhat+I+was+doing%3A%0A%0AWhat+I+expected%3A%0A"
}
```

## Related

- [unauthorized](/errors/unauthorized/): no signed-in session on the account endpoints.

---
title: Error codes
description: "Every error code the MarkdownScribe API returns, its HTTP status and what to do next. No error is charged."
---

Every error response from the MarkdownScribe API has the same shape:

| Field | Always | Meaning |
|---|---|---|
| `error` | yes | Stable code. Compare against this, never against `hint`. |
| `hint` | yes | One sentence saying what to do next. |
| `docs_url` | yes | The page for this code, below. |
| `request_id` | yes | Same value as the `X-Request-Id` header. Quote it in any report. |
| `next_step` | no | A command that resolves the error, when one exists. |
| `report_url` | 5xx only | A pre-filled issue that carries only the `request_id`. |

Some codes add their own fields, such as `details`, `balance`, `retry_after_seconds`, `line` and `column`. Only successful (2xx) calls are charged: no error costs credits.

| Code | HTTP | In one line |
|---|---|---|
| [validation](/errors/validation/) | 400 | The body is not valid JSON or has the wrong shape. |
| [invalid_request](/errors/invalid_request/) | 400 | URL to Markdown got an invalid URL or mode. |
| [unauthorized](/errors/unauthorized/) | 401 | No valid API key, or no session on account endpoints. |
| [insufficient_credits](/errors/insufficient_credits/) | 402 | The account has no credits left. |
| [not_found](/errors/not_found/) | 404 | The API key to revoke does not exist. |
| [key_limit_reached](/errors/key_limit_reached/) | 409 | Too many active keys to create another. |
| [payload_too_large](/errors/payload_too_large/) | 413 | The Markdown is larger than 1 MB. |
| [invalid_frontmatter](/errors/invalid_frontmatter/) | 422 | The YAML frontmatter does not parse. |
| [extraction_empty](/errors/extraction_empty/) | 422 | The page had no main content to extract. |
| [fetch_failed](/errors/fetch_failed/) | 424 | The page could not be reached. |
| [rate_limited](/errors/rate_limited/) | 429 | Too many requests per minute; wait `Retry-After`. |
| [internal](/errors/internal/) | 500 | Unexpected error on our side. |
| [service_unavailable](/errors/service_unavailable/) | 503 | Our browser service is temporarily down. |
| [clerk_not_configured](/errors/clerk_not_configured/) | 503 | Account endpoints misconfigured on our side. |
| [timeout](/errors/timeout/) | 504 | The page or the diagrams took too long. |

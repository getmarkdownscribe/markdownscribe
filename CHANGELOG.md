# Changelog

Both packages are versioned together while they move in lockstep. Dates are UTC.

## 0.2.0 — 2026-10-07

First release from this public repository, under the MIT license.

### `@markdownscribe/sdk`

- **Fixed:** the published type declarations imported `@markdownscribe/core`, a package that was never published, so every input and output type resolved to `any` (or failed with "Cannot find module"). Types are now generated from the API's OpenAPI document and ship inside the package.
- **Added:** the input and output types of the six operations are exported (`FrontmatterInput`, `FrontmatterOutput`, … `UrlToMdOutput`).
- **Added:** `meta.creditsRemaining`, the balance after the call, read from `X-Credits-Remaining`.
- **Added:** `MarkdownScribeApiError` exposes `hint`, `nextStep`, `docsUrl`, `reportUrl` and `requestId` from the API's error contract.
- **Changed:** the default base URL is `https://api.markdownscribe.com`.
- **Added:** `User-Agent: markdownscribe-sdk/<version> node/<version>` and, when detected, `X-Client-Env` (`claude-code`, `cursor`, `ci`, or the value of `AGENT`). Opt out with `MDSCRIBE_NO_CLIENT_ENV=1`.
- npm metadata: `repository`, `homepage`, `bugs`, `license`, provenance.

### `markdownscribe` (CLI)

- **Changed (breaking):** the API key is read from `MDSCRIBE_API_KEY` or from a `.env` file in the current directory. The undocumented `API_KEY_MAT` fallback was removed.
- **Added:** error messages end with the call's `request_id`, ready to paste into a bug report, plus the API's `Try:` / `Docs:` / `Report it:` lines when present.
- **Added:** a warning on stderr when the balance drops below 500 credits.
- **Changed:** uses the default base URL above; identifies itself as `markdownscribe-cli/<version>` in the `User-Agent`.

## 0.1.0 — 2026-09-18

Initial release of both packages.

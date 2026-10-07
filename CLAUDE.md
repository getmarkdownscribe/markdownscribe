# CLAUDE.md

Public clients (SDK and CLI) for the MarkdownScribe API. The API, billing and extraction live in a private repository; nothing here may depend on them.

What is not obvious from the code:

- **SDK types are generated** from `packages/sdk/openapi.json` into `src/generated/openapi.ts`. Never edit either by hand: `pnpm openapi:sync`. `pnpm openapi:check` fails when the committed document lags the live API.
- **The product description is canonical**: README first paragraph and both `package.json` descriptions must equal `GET https://api.markdownscribe.com/` → `description`. `node scripts/check-canonical.mjs` enforces it in CI.
- **Live tests** (`tests/live.test.ts`) spend real credits from `MDSCRIBE_API_KEY`. CI sets `MDSCRIBE_REQUIRE_LIVE=1` so a missing key fails instead of skipping.
- **Billing is verified elsewhere.** Tests that check the exact debit in the ledger need the private API and database, so they run in the private repository against the packed SDK and CLI. A change here that touches request shape or headers must be re-verified there before release.
- `version.ts` in each package must equal its `package.json` version (a test enforces it): the version goes in the `User-Agent` and drives adoption numbers.
- Scripts use `process.exitCode`, never `process.exit()`: on Node 24+ on Windows, exiting right after a `fetch` crashes on a libuv assertion.
- User-facing strings are in English. Code comments are in Portuguese and may cite internal decision ids (D-0xx, SPEC-0xx, MKD-xxx).

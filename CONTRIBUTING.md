# Contributing

Issues and pull requests are welcome.

## Reporting a bug

Use the [bug report form](https://github.com/getmarkdownscribe/markdownscribe/issues/new?template=bug.yml). The `request_id` field is required: every API response carries one (header `X-Request-Id`, `meta.request_id` in the SDK, and the CLI prints it on errors), and it is the only way to find your call on our side.

## Working on the code

Requirements: Node.js 22+ and pnpm 10+.

```bash
pnpm install
pnpm build
pnpm test
```

- **The SDK types are generated, never written by hand.** They come from the published OpenAPI document. `pnpm openapi:check` fails when `packages/sdk/openapi.json` is behind the live API; `pnpm openapi:sync` updates it and regenerates `packages/sdk/src/generated/openapi.ts`.
- **Live tests** (`tests/live.test.ts` in each package) call the real API with `MDSCRIBE_API_KEY` and spend a few credits from that key. Without the variable they are skipped with a warning. Pull requests from forks run without the key; a maintainer runs them before merging.
- The CLI is a thin layer over the SDK, and the SDK is a thin layer over the REST API. Neither carries business logic of its own.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) (`feat(cli): ...`, `fix(sdk): ...`). User-facing strings (CLI messages, errors, README) are in English.

## Releases

Maintainers only. Bump the version in `package.json` and in `src/version.ts` (a test keeps the two in sync), update `CHANGELOG.md`, then push a tag `sdk-vX.Y.Z` or `cli-vX.Y.Z`. The release workflow publishes to npm with provenance through trusted publishing; no npm token is stored in this repository.

# @markdownscribe/sdk

Typed HTTP client for the [MarkdownScribe](https://api.markdownscribe.com) API — frontmatter, table of contents, lint, format, Mermaid-to-SVG, and URL-to-Markdown, all in one small dependency. Designed to be easy for both humans and LLM/agent tooling to discover and call correctly on the first try.

## Install

```bash
npm install @markdownscribe/sdk
```

## Usage

```ts
import { MarkdownScribeClient, MarkdownScribeApiError } from "@markdownscribe/sdk";

const client = new MarkdownScribeClient({ apiKey: process.env.MDSCRIBE_API_KEY! });

try {
  const { frontmatter, body, meta } = await client.frontmatter({
    markdown: "---\ntitle: Hello\n---\n\nBody.\n",
  });
  console.log(frontmatter, meta.credits);
} catch (err) {
  if (err instanceof MarkdownScribeApiError) {
    console.error(err.status, err.body.error, err.requestId);
  }
}
```

## Methods

| Method | Endpoint | What it does |
|---|---|---|
| `frontmatter(input)` | `POST /v1/md/frontmatter` | Extract YAML frontmatter + body from Markdown |
| `toc(input)` | `POST /v1/md/toc` | Generate a table of contents from headings |
| `format(input)` | `POST /v1/md/format` | Normalize Markdown formatting |
| `lint(input)` | `POST /v1/md/lint` | Lint Markdown against structural rules |
| `mermaid(input)` | `POST /v1/md/mermaid` | Render Mermaid diagrams (in a `.mmd` string or embedded in Markdown) to SVG |
| `urlToMd(input)` | `POST /v1/url-to-md` | Convert a web page into Markdown (`clean` or `raw` mode) |

Every method returns the operation's result plus a `meta` object (`request_id`, `credits`, and `duration_ms` where applicable) — the same data used to reconcile what was charged.

### Watching the balance

`meta.creditsRemaining` is the account balance **after** the call, read from the `X-Credits-Remaining` response header:

```ts
const result = await client.lint({ markdown });

if (result.meta.creditsRemaining !== undefined && result.meta.creditsRemaining < 500) {
  console.warn(`${result.meta.creditsRemaining} credits left`);
}
```

Two properties worth relying on:

- **It is not an estimate.** The API reads it inside the same transaction that debits the call, so it does not drift when several calls run concurrently.
- **It is absent when nothing was charged** — errors, and any call whose debit did not go through. Absence means "no charge happened", not "unknown". Treat it as information, not as a gap to fill with a guess.

An unattended agent that watches this number can decide whether the next task fits before starting it, instead of discovering the limit by failing with `402 insufficient_credits`.

## What the SDK sends about your environment

Two headers go out with every request. Both describe **software**, never a person.

**`User-Agent`** — the library and runtime:

```text
markdownscribe-sdk/0.1.0 node/v22.14.0
```

The CLI prefixes its own name, so the two can be told apart:

```text
markdownscribe-cli/0.1.0 markdownscribe-sdk/0.1.0 node/v22.14.0
```

If you build a tool on top of this SDK, identify it the same way:

```ts
const client = new MarkdownScribeClient({
  apiKey,
  userAgentPrefix: "my-tool/1.2.0",
});
```

**`X-Client-Env`** — the coding environment the call originated from, when it can be detected: `claude-code`, `cursor`, `ci`, or whatever `AGENT` is set to (a convention some agents follow). The header is **omitted entirely** when nothing is detected — there is no `unknown` value.

Detection reads these environment variables and nothing else:

| Variable | Result |
|---|---|
| `AGENT` | its value, lowercased and slugified |
| `CLAUDECODE` | `claude-code` |
| `CURSOR_AGENT` | `cursor` |
| `CI` | `ci` |

### Turning it off

```bash
export MDSCRIBE_NO_CLIENT_ENV=1
```

No `X-Client-Env` header is sent. Everything else keeps working.

### What is never sent

No username, hostname, file path, operating system, directory contents, or the content of your environment variables — only the fixed labels in the table above. The `User-Agent` carries library and Node versions, which every HTTP client sends anyway.

Why we collect it at all, stated plainly: we want to know what share of calls come from coding agents rather than people. That number decides where the product goes next. If you would rather not be counted, the switch above is the whole opt-out.

## Errors

All failures throw `MarkdownScribeApiError` (`status`, `body`, `requestId`), normalizing every error family the API returns (validation/auth/billing, internal errors, and upstream-extraction-service failures) into one consistent shape.

## Scope

This SDK covers the 6 REST markdown operations authenticated via `X-API-Key`. Account/session endpoints (Clerk-authenticated dashboard) are out of scope. A first-class MCP server (for direct use from Claude and other agent runtimes) is planned for a follow-up sprint — see the [markdownscribe CLI](../cli/README.md) for terminal usage today.

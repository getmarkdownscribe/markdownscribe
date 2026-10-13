---
title: invalid_frontmatter
description: "HTTP 422. The YAML frontmatter at the top of the document does not parse. The response points to the line and column."
---

**HTTP status:** 422 Unprocessable Content · **Charged:** no

## What it means

The block between the two `---` lines at the top of the document is not valid YAML. The response tells you where the parser stopped: `line` and `column` count from the first line of the document, and `message` is the parser's own description. `kind` is `invalid_yaml`.

## What to do

Go to the line and column in the response and check the usual causes:

1. **Indentation.** Use spaces, never tabs, and keep keys at the same level aligned.
2. **Colons inside values.** A value such as `title: Release: October` needs quotes: `title: "Release: October"`.
3. **A missing colon** after a key.

Fix the document and call again.

## Example response

Captured from the production API on 2026-10-13. The document had `  date: 2026-10-13` indented under `title`, which YAML reads as a broken mapping.

```json
{
  "error": "invalid_frontmatter",
  "hint": "The frontmatter block between `---` delimiters is not valid YAML. Check indentation (2 spaces, no tabs), quoting on values with special characters, and colons after every key. The `line` and `column` fields point to the first parser failure.",
  "kind": "invalid_yaml",
  "message": "bad indentation of a mapping entry",
  "line": 3,
  "column": 7,
  "docs_url": "https://docs.markdownscribe.com/errors/invalid_frontmatter",
  "request_id": "01M4TRDFZ9G5EFRNK42RN2XQJH"
}
```

## Related

- [validation](/errors/validation/): the request body itself is the wrong shape.

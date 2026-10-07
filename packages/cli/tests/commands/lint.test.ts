import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { runLint } from "../../src/commands/lint.js";

// mock_justification: ver frontmatter.test.ts — rede real já provada no chunk C.
function fakeClient(lintImpl: MarkdownScribeClient["lint"]): MarkdownScribeClient {
  return { lint: lintImpl } as unknown as MarkdownScribeClient;
}

describe("runLint", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "mdscribe-cmd-lint-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("prints findings with rule/line/message and credits charged", async () => {
    const file = join(dir, "doc.md");
    writeFileSync(file, "##### too deep\n");
    const lintImpl = vi.fn().mockResolvedValue({
      valid: false,
      findings: [
        {
          rule: "MD001",
          name: "heading-increment",
          line: 1,
          message: "Heading levels should only increment by one level at a time",
          doc_url: "https://example.com/MD001",
        },
      ],
      summary: { total: 1 },
      meta: { request_id: "req-1", credits: 2 },
    });

    const result = await runLint(file, fakeClient(lintImpl));

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/MD001/);
    expect(result.stdout).toMatch(/line 1/i);
    expect(result.stdout).toMatch(/credits charged: 2/);
  });

  it("maps a 413 payload_too_large error to exit code 5", async () => {
    const file = join(dir, "doc.md");
    writeFileSync(file, "# a");
    const lintImpl = vi.fn().mockRejectedValue(new MarkdownScribeApiError(413, { error: "payload_too_large" }));

    const result = await runLint(file, fakeClient(lintImpl));

    expect(result.exitCode).toBe(5);
  });
});

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { runToc } from "../../src/commands/toc.js";

// mock_justification: ver frontmatter.test.ts — rede real já provada no chunk C.
function fakeClient(tocImpl: MarkdownScribeClient["toc"]): MarkdownScribeClient {
  return { toc: tocImpl } as unknown as MarkdownScribeClient;
}

describe("runToc", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "mdscribe-cmd-toc-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("prints the generated TOC and credits charged", async () => {
    const file = join(dir, "doc.md");
    writeFileSync(file, "# Title\n\n## Section\n");
    const tocImpl = vi.fn().mockResolvedValue({
      toc: "- [Title](#title)\n  - [Section](#section)\n",
      headings: [
        { depth: 1, text: "Title", slug: "title", line: 1 },
        { depth: 2, text: "Section", slug: "section", line: 3 },
      ],
      meta: { request_id: "req-1", credits: 1 },
    });

    const result = await runToc(file, { minDepth: 2, maxDepth: 4 }, fakeClient(tocImpl));

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[Title](#title)");
    expect(result.stdout).toMatch(/credits charged: 1/);
    expect(tocImpl).toHaveBeenCalledWith({
      markdown: "# Title\n\n## Section\n",
      options: { min_depth: 2, max_depth: 4 },
    });
  });

  it("maps a 422 validation error to exit code 5", async () => {
    const file = join(dir, "doc.md");
    writeFileSync(file, "# Title\n");
    const tocImpl = vi
      .fn()
      .mockRejectedValue(new MarkdownScribeApiError(422, { error: "validation", hint: "min_depth > max_depth" }));

    const result = await runToc(file, {}, fakeClient(tocImpl));

    expect(result.exitCode).toBe(5);
    expect(result.stderr).toMatch(/min_depth/);
  });
});

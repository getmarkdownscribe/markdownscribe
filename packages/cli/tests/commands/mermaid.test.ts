import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { runMermaid } from "../../src/commands/mermaid.js";

// mock_justification: ver frontmatter.test.ts — rede real já provada no chunk C.
function fakeClient(mermaidImpl: MarkdownScribeClient["mermaid"]): MarkdownScribeClient {
  return { mermaid: mermaidImpl } as unknown as MarkdownScribeClient;
}

describe("runMermaid", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "mdscribe-cmd-mermaid-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("rejects a directory with exit code 5, without calling the client", async () => {
    const mermaidImpl = vi.fn();

    const result = await runMermaid(dir, fakeClient(mermaidImpl));

    expect(result.exitCode).toBe(5);
    expect(mermaidImpl).not.toHaveBeenCalled();
  });

  it(".mmd file sends {diagram} and writes each rendered SVG next to the source, UTF-8 without BOM", async () => {
    const file = join(dir, "graph.mmd");
    writeFileSync(file, "graph TD; A-->B;");
    const mermaidImpl = vi.fn().mockResolvedValue({
      diagrams: [{ index: 0, line: 1, svg: "<svg>ok</svg>" }],
      errors: [],
      summary: { total: 1, rendered: 1, failed: 0 },
      meta: { request_id: "req-1", credits: 5 },
    });

    const result = await runMermaid(file, fakeClient(mermaidImpl));

    expect(mermaidImpl).toHaveBeenCalledWith({ diagram: "graph TD; A-->B;" });
    const svgPath = join(dir, "graph-diagram-1.svg");
    const written = readFileSync(svgPath);
    expect(written.toString("utf8")).toBe("<svg>ok</svg>");
    expect(written[0]).not.toBe(0xef);
    expect(result.stdout).toMatch(/1\/1 rendered/);
    expect(result.exitCode).toBe(0);
  });

  it(".md file with no mermaid blocks sends {markdown} and reports zero blocks without writing any SVG", async () => {
    const file = join(dir, "doc.md");
    writeFileSync(file, "# no diagrams here\n");
    const mermaidImpl = vi.fn().mockResolvedValue({
      diagrams: [],
      errors: [],
      summary: { total: 0, rendered: 0, failed: 0 },
      meta: { request_id: "req-1", credits: 1 },
    });

    const result = await runMermaid(file, fakeClient(mermaidImpl));

    expect(mermaidImpl).toHaveBeenCalledWith({ markdown: "# no diagrams here\n" });
    expect(result.stdout).toMatch(/no mermaid blocks/i);
    expect(result.exitCode).toBe(0);
  });

  it("maps a 424 upstream error to exit code 6", async () => {
    const file = join(dir, "graph.mmd");
    writeFileSync(file, "graph TD; A-->B;");
    const mermaidImpl = vi.fn().mockRejectedValue(new MarkdownScribeApiError(424, { error: "fetch_failed" }));

    const result = await runMermaid(file, fakeClient(mermaidImpl));

    expect(result.exitCode).toBe(6);
  });
});

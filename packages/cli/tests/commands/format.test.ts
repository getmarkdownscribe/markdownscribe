import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { runFormat } from "../../src/commands/format.js";

// mock_justification: ver frontmatter.test.ts — rede real já provada no chunk C.
function fakeClient(formatImpl: MarkdownScribeClient["format"]): MarkdownScribeClient {
  return { format: formatImpl } as unknown as MarkdownScribeClient;
}

describe("runFormat", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "mdscribe-cmd-format-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("prints the formatted markdown by default without touching the file", async () => {
    const file = join(dir, "doc.md");
    const original = "*x*\n";
    writeFileSync(file, original);
    const formatImpl = vi.fn().mockResolvedValue({
      formatted: "_x_\n",
      changed: true,
      meta: { request_id: "req-1", credits: 2 },
    });

    const result = await runFormat(file, {}, fakeClient(formatImpl));

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("_x_");
    expect(readFileSync(file, "utf8")).toBe(original);
    expect(formatImpl).toHaveBeenCalledWith({
      markdown: original,
      options: { prose_wrap: "preserve" },
    });
  });

  it("--write overwrites the file with the formatted content, UTF-8 without BOM", async () => {
    const file = join(dir, "doc.md");
    writeFileSync(file, "*x*\n");
    const formatImpl = vi.fn().mockResolvedValue({
      formatted: "_x_\n",
      changed: true,
      meta: { request_id: "req-1", credits: 2 },
    });

    await runFormat(file, { write: true, proseWrap: "always" }, fakeClient(formatImpl));

    const written = readFileSync(file);
    expect(written.toString("utf8")).toBe("_x_\n");
    expect(written[0]).not.toBe(0xef); // sem BOM UTF-8 (EF BB BF)
    expect(formatImpl).toHaveBeenCalledWith({
      markdown: "*x*\n",
      options: { prose_wrap: "always" },
    });
  });

  it("--check reports changed status without printing content or writing the file", async () => {
    const file = join(dir, "doc.md");
    const original = "*x*\n";
    writeFileSync(file, original);
    const formatImpl = vi.fn().mockResolvedValue({
      formatted: "_x_\n",
      changed: true,
      meta: { request_id: "req-1", credits: 2 },
    });

    const result = await runFormat(file, { check: true }, fakeClient(formatImpl));

    expect(result.stdout).toMatch(/changed/);
    expect(result.stdout).not.toContain("_x_");
    expect(readFileSync(file, "utf8")).toBe(original);
  });

  it("maps a 400 validation error to exit code 5", async () => {
    const file = join(dir, "doc.md");
    writeFileSync(file, "# a");
    const formatImpl = vi.fn().mockRejectedValue(new MarkdownScribeApiError(400, { error: "validation" }));

    const result = await runFormat(file, {}, fakeClient(formatImpl));

    expect(result.exitCode).toBe(5);
  });
});

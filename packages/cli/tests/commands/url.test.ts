import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { runUrl } from "../../src/commands/url.js";

// mock_justification: ver frontmatter.test.ts — rede real já provada no chunk C.
function fakeClient(urlToMdImpl: MarkdownScribeClient["urlToMd"]): MarkdownScribeClient {
  return { urlToMd: urlToMdImpl } as unknown as MarkdownScribeClient;
}

describe("runUrl", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "mdscribe-cmd-url-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("prints the extracted markdown and credits charged by default (mode clean)", async () => {
    const urlToMdImpl = vi.fn().mockResolvedValue({
      markdown: "# Article\n\nBody.\n",
      mode: "clean",
      metadata: {
        title: "Article",
        author: null,
        published_date: null,
        used_playwright: false,
        extraction_quality: null,
      },
      meta: { request_id: "req-1", credits: 3 },
    });

    const result = await runUrl("https://example.com/post", {}, fakeClient(urlToMdImpl));

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("# Article");
    expect(result.stdout).toMatch(/credits charged: 3/);
    expect(urlToMdImpl).toHaveBeenCalledWith({ url: "https://example.com/post", mode: "clean" });
  });

  it("--mode raw is forwarded to the client", async () => {
    const urlToMdImpl = vi.fn().mockResolvedValue({
      markdown: "raw page\n",
      mode: "raw",
      metadata: {
        title: null,
        author: null,
        published_date: null,
        used_playwright: false,
        extraction_quality: null,
      },
      meta: { request_id: "req-1", credits: 3 },
    });

    await runUrl("https://example.com/post", { mode: "raw" }, fakeClient(urlToMdImpl));

    expect(urlToMdImpl).toHaveBeenCalledWith({ url: "https://example.com/post", mode: "raw" });
  });

  it("--save writes the markdown to disk, UTF-8 without BOM, instead of printing it", async () => {
    const urlToMdImpl = vi.fn().mockResolvedValue({
      markdown: "# Article\n",
      mode: "clean",
      metadata: {
        title: "Article",
        author: null,
        published_date: null,
        used_playwright: false,
        extraction_quality: null,
      },
      meta: { request_id: "req-1", credits: 3 },
    });
    const savePath = join(dir, "out.md");

    const result = await runUrl("https://example.com/post", { save: savePath }, fakeClient(urlToMdImpl));

    const written = readFileSync(savePath);
    expect(written.toString("utf8")).toBe("# Article\n");
    expect(written[0]).not.toBe(0xef);
    expect(result.stdout).not.toContain("# Article");
    expect(result.stdout).toMatch(/saved to/i);
  });

  it("maps a 504 timeout error to exit code 6", async () => {
    const urlToMdImpl = vi.fn().mockRejectedValue(new MarkdownScribeApiError(504, { error: "timeout" }));

    const result = await runUrl("https://example.com/post", {}, fakeClient(urlToMdImpl));

    expect(result.exitCode).toBe(6);
  });
});

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { runFrontmatter } from "../../src/commands/frontmatter.js";

// mock_justification (SPEC-010 §CLI, blueprint prompt 5): a chamada de rede
// real do SDK já foi provada contra o Postgres real no chunk C
// (packages/sdk/tests/client.test.ts, débito conferido em credit_ledger).
// Aqui testamos só a lógica do subcomando — leitura de arquivo/pasta,
// formatação de saída, exit code — então o client injetado é um dublê que
// implementa somente o método usado por este comando.
function fakeClient(frontmatterImpl: MarkdownScribeClient["frontmatter"]): MarkdownScribeClient {
  return { frontmatter: frontmatterImpl } as unknown as MarkdownScribeClient;
}

describe("runFrontmatter", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "mdscribe-cmd-fm-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("prints frontmatter and total credits charged for a single file", async () => {
    const file = join(dir, "post.md");
    writeFileSync(file, "---\ntitle: hello\n---\n\nBody.\n");
    const frontmatterImpl = vi.fn().mockResolvedValue({
      frontmatter: { title: "hello" },
      body: "Body.\n",
      meta: { request_id: "req-1", credits: 1 },
    });

    const result = await runFrontmatter(file, fakeClient(frontmatterImpl));

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("hello");
    expect(result.stdout).toMatch(/credits charged: 1/);
    expect(frontmatterImpl).toHaveBeenCalledWith({ markdown: "---\ntitle: hello\n---\n\nBody.\n" });
  });

  it("processes every .md/.mdx file in a directory and sums credits", async () => {
    writeFileSync(join(dir, "a.md"), "# a");
    writeFileSync(join(dir, "b.mdx"), "# b");
    const frontmatterImpl = vi.fn().mockResolvedValue({
      frontmatter: null,
      body: "x",
      meta: { request_id: "req-2", credits: 1 },
    });

    const result = await runFrontmatter(dir, fakeClient(frontmatterImpl));

    expect(frontmatterImpl).toHaveBeenCalledTimes(2);
    expect(result.stdout).toMatch(/credits charged: 2/);
  });

  it("maps a 402 error to exit code 3 and reports balance in stderr without throwing", async () => {
    const file = join(dir, "post.md");
    writeFileSync(file, "# a");
    const frontmatterImpl = vi
      .fn()
      .mockRejectedValue(new MarkdownScribeApiError(402, { error: "insufficient_credits", balance: 0 }));

    const result = await runFrontmatter(file, fakeClient(frontmatterImpl));

    expect(result.exitCode).toBe(3);
    expect(result.stderr).toMatch(/balance.*0/i);
  });
});

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { CLI_DIR, runCli } from "./support/run-cli.js";

// O BINÁRIO compilado (dist/bin.js, o mesmo artefato publicado) contra a API
// real, com a chave em MDSCRIBE_API_KEY. Mesma regra do teste ao vivo do SDK:
// sem chave pula com aviso; com MDSCRIBE_REQUIRE_LIVE=1 a falta da chave falha.
const API_KEY = process.env["MDSCRIBE_API_KEY"];
const REPO_README = join(CLI_DIR, "..", "..", "README.md");

if (!API_KEY) {
  if (process.env["MDSCRIBE_REQUIRE_LIVE"] === "1") {
    throw new Error("MDSCRIBE_REQUIRE_LIVE=1 but MDSCRIBE_API_KEY is not set: live tests cannot run.");
  }
  // stderr direto: o vitest engole console.* de arquivo cujos testes pularam.
  process.stderr.write("[live] MDSCRIBE_API_KEY not set: skipping live CLI tests.\n");
}

describe.skipIf(!API_KEY)("CLI contra a API real", () => {
  const dir = mkdtempSync(join(tmpdir(), "mdscribe-live-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  const env = (): Record<string, string> => ({
    MDSCRIBE_API_KEY: API_KEY!,
    ...(process.env["MDSCRIBE_URL"] ? { MDSCRIBE_URL: process.env["MDSCRIBE_URL"] } : {}),
  });

  it("frontmatter de um arquivo: imprime o YAML parseado e os créditos", () => {
    const file = join(dir, "post.md");
    writeFileSync(file, "---\ntitle: Release notes\ndate: 2026-10-07\n---\n\n# Release notes\n");

    const result = runCli(["frontmatter", file], env());

    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('"title": "Release notes"');
    expect(result.stdout).toContain("credits charged: 1");
  }, 30_000);

  it("lint do README deste repositório passa sem achados (dogfood)", () => {
    const result = runCli(["lint", REPO_README], env());

    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
  }, 30_000);
});

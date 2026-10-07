import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { collectMarkdownFiles } from "../src/fs-utils.js";

// SPEC-010 §CLI: frontmatter/toc/format/lint aceitam arquivo OU pasta
// (não-recursiva). Usado pelos subcomandos do chunk E.
describe("collectMarkdownFiles", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "mdscribe-fs-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns the single file when given a file path", () => {
    const file = join(dir, "a.md");
    writeFileSync(file, "# a");

    expect(collectMarkdownFiles(file)).toEqual([file]);
  });

  it("returns .md and .mdx files in a directory, sorted, ignoring other extensions and subfolders", () => {
    writeFileSync(join(dir, "b.md"), "# b");
    writeFileSync(join(dir, "a.mdx"), "# a");
    writeFileSync(join(dir, "ignore.txt"), "not markdown");
    const sub = join(dir, "sub");
    mkdirSync(sub);
    writeFileSync(join(sub, "nested.md"), "# nested");

    expect(collectMarkdownFiles(dir)).toEqual([join(dir, "a.mdx"), join(dir, "b.md")]);
  });
});

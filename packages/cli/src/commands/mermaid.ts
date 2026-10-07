import { readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { formatError } from "../output.js";
import type { CommandResult } from "./types.js";

export async function runMermaid(pathArg: string, client: MarkdownScribeClient): Promise<CommandResult> {
  const stat = statSync(pathArg);
  if (stat.isDirectory()) {
    return { exitCode: 5, stdout: "", stderr: "mermaid: pass a single file, not a directory\n" };
  }

  const content = readFileSync(pathArg, "utf8");
  const isDiagram = extname(pathArg).toLowerCase() === ".mmd";

  try {
    const result = isDiagram
      ? await client.mermaid({ diagram: content })
      : await client.mermaid({ markdown: content });

    if (result.summary.total === 0) {
      return {
        exitCode: 0,
        stdout: `no mermaid blocks found (charged ${result.meta.credits} credit)\n`,
        creditsRemaining: result.meta.creditsRemaining,
        stderr: "",
      };
    }

    const dir = dirname(pathArg);
    const base = basename(pathArg, extname(pathArg));
    let stdout = "";
    let stderr = "";

    for (const diagram of result.diagrams) {
      const n = diagram.index + 1;
      const svgPath = join(dir, `${base}-diagram-${n}.svg`);
      // SVG em UTF-8 sem BOM (BOM quebra alguns viewers) — mesma escrita
      // que o script mdscribe-mermaid.ps1 atual já faz.
      writeFileSync(svgPath, diagram.svg, "utf8");
      stdout += `ok: ${base}-diagram-${n}.svg\n`;
    }

    for (const diagramError of result.errors) {
      stderr += `failed (diagram ${diagramError.index + 1}): ${diagramError.message}\n`;
    }

    stdout += `\n${result.summary.rendered}/${result.summary.total} rendered — ${result.meta.credits} credits\n`;

    return { exitCode: 0, stdout, stderr, creditsRemaining: result.meta.creditsRemaining };
  } catch (err) {
    if (!(err instanceof MarkdownScribeApiError)) throw err;
    const formatted = formatError(err);
    return { exitCode: formatted.exitCode, stdout: "", stderr: `${formatted.message}\n` };
  }
}

import { readFileSync } from "node:fs";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { collectMarkdownFiles } from "../fs-utils.js";
import { formatError } from "../output.js";
import type { CommandResult } from "./types.js";

export interface TocOptions {
  minDepth?: number;
  maxDepth?: number;
}

export async function runToc(
  pathArg: string,
  options: TocOptions,
  client: MarkdownScribeClient
): Promise<CommandResult> {
  const files = collectMarkdownFiles(pathArg);
  let stdout = "";
  let stderr = "";
  let exitCode = 0;
  let totalCredits = 0;
  // Sprint 11 / MKD-132: guarda o saldo da ultima chamada cobrada. Quem
  // imprime o aviso e o bin.ts, uma vez so por execucao — varios arquivos
  // processados nao viram varios avisos iguais.
  let creditsRemaining: number | undefined;

  const tocOptions: { min_depth?: number; max_depth?: number } = {};
  if (options.minDepth !== undefined) tocOptions.min_depth = options.minDepth;
  if (options.maxDepth !== undefined) tocOptions.max_depth = options.maxDepth;

  for (const file of files) {
    const markdown = readFileSync(file, "utf8");
    try {
      const result = await client.toc({ markdown, options: tocOptions });
      totalCredits += result.meta.credits;
      creditsRemaining = result.meta.creditsRemaining ?? creditsRemaining;
      stdout += `=== ${file} ===\n${result.toc}\n`;
    } catch (err) {
      if (!(err instanceof MarkdownScribeApiError)) throw err;
      const formatted = formatError(err);
      stderr += `${file}: ${formatted.message}\n`;
      exitCode = formatted.exitCode;
    }
  }

  if (exitCode === 0) {
    stdout += `\ncredits charged: ${totalCredits}\n`;
  }

  return { exitCode, stdout, stderr, creditsRemaining };
}

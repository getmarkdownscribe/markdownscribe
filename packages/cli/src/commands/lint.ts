import { readFileSync } from "node:fs";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { collectMarkdownFiles } from "../fs-utils.js";
import { formatError } from "../output.js";
import type { CommandResult } from "./types.js";

export async function runLint(pathArg: string, client: MarkdownScribeClient): Promise<CommandResult> {
  const files = collectMarkdownFiles(pathArg);
  let stdout = "";
  let stderr = "";
  let exitCode = 0;
  let totalCredits = 0;
  // Sprint 11 / MKD-132: guarda o saldo da ultima chamada cobrada. Quem
  // imprime o aviso e o bin.ts, uma vez so por execucao — varios arquivos
  // processados nao viram varios avisos iguais.
  let creditsRemaining: number | undefined;

  for (const file of files) {
    const markdown = readFileSync(file, "utf8");
    try {
      const result = await client.lint({ markdown });
      totalCredits += result.meta.credits;
      creditsRemaining = result.meta.creditsRemaining ?? creditsRemaining;
      stdout += `=== ${file} (${result.summary.total} finding(s)) ===\n`;
      for (const finding of result.findings) {
        stdout += `${finding.rule} line ${finding.line}: ${finding.message}\n`;
      }
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

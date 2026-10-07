import { readFileSync, writeFileSync } from "node:fs";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { collectMarkdownFiles } from "../fs-utils.js";
import { formatError } from "../output.js";
import type { CommandResult } from "./types.js";

export interface FormatOptions {
  proseWrap?: "preserve" | "always" | "never";
  write?: boolean;
  check?: boolean;
}

export async function runFormat(
  pathArg: string,
  options: FormatOptions,
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

  for (const file of files) {
    const markdown = readFileSync(file, "utf8");
    try {
      const result = await client.format({
        markdown,
        options: { prose_wrap: options.proseWrap ?? "preserve" },
      });
      totalCredits += result.meta.credits;
      creditsRemaining = result.meta.creditsRemaining ?? creditsRemaining;

      if (options.check) {
        stdout += `${result.changed ? "changed" : "ok"}: ${file}\n`;
      } else if (options.write) {
        if (result.changed) {
          // UTF-8 sem BOM (diferente de PowerShell Out-File -Encoding utf8,
          // que grava BOM — bug do script atual que este CLI corrige).
          writeFileSync(file, result.formatted, "utf8");
          stdout += `formatted: ${file}\n`;
        } else {
          stdout += `already formatted: ${file}\n`;
        }
      } else {
        stdout += result.formatted;
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

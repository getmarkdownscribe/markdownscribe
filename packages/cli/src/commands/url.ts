import { writeFileSync } from "node:fs";
import type { MarkdownScribeClient } from "@markdownscribe/sdk";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

import { formatError } from "../output.js";
import type { CommandResult } from "./types.js";

export interface UrlOptions {
  mode?: "clean" | "raw";
  save?: string;
}

export async function runUrl(
  url: string,
  options: UrlOptions,
  client: MarkdownScribeClient
): Promise<CommandResult> {
  try {
    const result = await client.urlToMd({ url, mode: options.mode ?? "clean" });
    let stdout = "";

    if (options.save) {
      // UTF-8 sem BOM — corrige o bug de BOM do script mdscribe-url.ps1
      // atual (Out-File -Encoding utf8 grava BOM).
      writeFileSync(options.save, result.markdown, "utf8");
      stdout += `saved to: ${options.save}\n`;
    } else {
      stdout += result.markdown;
    }

    stdout += `\ncredits charged: ${result.meta.credits}\n`;

    return { exitCode: 0, stdout, stderr: "", creditsRemaining: result.meta.creditsRemaining };
  } catch (err) {
    if (!(err instanceof MarkdownScribeApiError)) throw err;
    const formatted = formatError(err);
    return { exitCode: formatted.exitCode, stdout: "", stderr: `${formatted.message}\n` };
  }
}

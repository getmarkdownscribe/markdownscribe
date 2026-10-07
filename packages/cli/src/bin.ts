#!/usr/bin/env node
import { Command } from "commander";
import { CLI_VERSION } from "./version.js";
import { lowBalanceWarning } from "./output.js";
import { MarkdownScribeClient } from "@markdownscribe/sdk";

import { ConfigError, resolveConfig } from "./config.js";
import { runFrontmatter } from "./commands/frontmatter.js";
import { runToc } from "./commands/toc.js";
import { runFormat } from "./commands/format.js";
import { runLint } from "./commands/lint.js";
import { runMermaid } from "./commands/mermaid.js";
import { runUrl } from "./commands/url.js";
import type { CommandResult } from "./commands/types.js";

interface GlobalOptions {
  baseUrl?: string;
}

function getClient(opts: GlobalOptions): MarkdownScribeClient {
  const configOptions: Parameters<typeof resolveConfig>[0] = { cwd: process.cwd() };
  if (opts.baseUrl !== undefined) configOptions.baseUrlFlag = opts.baseUrl;
  const config = resolveConfig(configOptions);
  // Sprint 11 / MKD-133: o prefixo e o que separa "chamada de terminal" de
  // "chamada de codigo" em op_metrics. Sem ele o CLI herdaria o User-Agent do
  // SDK e as duas origens virariam uma so.
  return new MarkdownScribeClient({
    ...config,
    userAgentPrefix: `markdownscribe-cli/${CLI_VERSION}`,
  });
}

// Nunca usar process.exit() aqui: no Node 24+ no Windows, forçar saída logo
// depois de um fetch() cria uma corrida real com o fechamento de handles do
// libuv e derruba o processo com "Assertion failed:
// !(handle->flags & UV_HANDLE_CLOSING)" DEPOIS do resultado já ter sido
// impresso corretamente — bug upstream do Node, sem fix lançado ainda
// (nodejs/node#56645, nodejs/node#58091). Setar process.exitCode e deixar o
// processo encerrar sozinho evita a corrida sem mudar o exit code observado
// externamente.
function emit(result: CommandResult): void {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  // Sprint 11 / MKD-132: aviso de saldo baixo, uma vez por execucao e sempre
  // DEPOIS do resultado — ele e contexto, nao conteudo. Vai pro stderr para
  // nao contaminar quem faz pipe do stdout.
  const aviso = lowBalanceWarning(result.creditsRemaining);
  if (aviso) process.stderr.write(aviso);

  process.exitCode = result.exitCode;
}

async function execute(fn: () => Promise<CommandResult>): Promise<void> {
  try {
    emit(await fn());
  } catch (err) {
    if (err instanceof ConfigError) {
      process.stderr.write(`${err.message}\n`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

const program = new Command();

program
  .name("markdownscribe")
  .description(
    "MarkdownScribe CLI — frontmatter, TOC, lint, format, mermaid and url-to-markdown from the terminal."
  )
  .version(CLI_VERSION)
  .option("--base-url <url>", "override the MarkdownScribe API base URL");

program
  .command("frontmatter")
  .description("Extract frontmatter from a Markdown file or directory")
  .argument("<path>", "file or directory (non-recursive)")
  .action((path: string) =>
    execute(() => runFrontmatter(path, getClient(program.opts<GlobalOptions>())))
  );

program
  .command("toc")
  .description("Generate a table of contents for a Markdown file or directory")
  .argument("<path>", "file or directory (non-recursive)")
  .option("--min-depth <n>", "minimum heading depth", (v) => Number.parseInt(v, 10))
  .option("--max-depth <n>", "maximum heading depth", (v) => Number.parseInt(v, 10))
  .action((path: string, opts: { minDepth?: number; maxDepth?: number }) =>
    execute(() => runToc(path, opts, getClient(program.opts<GlobalOptions>())))
  );

program
  .command("format")
  .description("Normalize a Markdown file or directory")
  .argument("<path>", "file or directory (non-recursive)")
  .option("--prose-wrap <mode>", "preserve|always|never", "preserve")
  .option("--write", "overwrite the file with the formatted content")
  .option("--check", "report changed status without writing or printing")
  .action(
    (
      path: string,
      opts: { proseWrap: "preserve" | "always" | "never"; write?: boolean; check?: boolean }
    ) => execute(() => runFormat(path, opts, getClient(program.opts<GlobalOptions>())))
  );

program
  .command("lint")
  .description("Lint a Markdown file or directory")
  .argument("<path>", "file or directory (non-recursive)")
  .action((path: string) => execute(() => runLint(path, getClient(program.opts<GlobalOptions>()))));

program
  .command("mermaid")
  .description("Render Mermaid diagrams from a .mmd or .md file to SVG")
  .argument("<path>", "single .mmd or .md/.mdx file")
  .action((path: string) =>
    execute(() => runMermaid(path, getClient(program.opts<GlobalOptions>())))
  );

program
  .command("url")
  .description("Convert a web page to Markdown")
  .argument("<url>", "http(s) URL")
  .option("--mode <mode>", "clean|raw", "clean")
  .option("--save <path>", "write the result to a file instead of stdout")
  .action((url: string, opts: { mode: "clean" | "raw"; save?: string }) =>
    execute(() => runUrl(url, opts, getClient(program.opts<GlobalOptions>())))
  );

await program.parseAsync(process.argv);

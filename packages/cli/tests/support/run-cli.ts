import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const CLI_DIR = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const BIN_PATH = join(CLI_DIR, "dist/bin.js");

export interface CliResult {
  stdout: string;
  stderr: string;
  status: number;
}

// Roda o BINÁRIO compilado de verdade (dist/bin.js, o mesmo artefato que o
// npm vai publicar) via subprocesso real — não chama nenhuma função do CLI
// diretamente. Isso é o que prova que build/empacotamento (bin no
// package.json, shebang, resolução de módulo ESM) também funcionam, não só
// a lógica interna já coberta pelos testes unitários do chunk E.
export function runCli(args: string[], env: Record<string, string>): CliResult {
  try {
    const stdout = execFileSync("node", [BIN_PATH, ...args], {
      env: { ...process.env, ...env },
      encoding: "utf8",
    });
    return { stdout, stderr: "", status: 0 };
  } catch (err) {
    const failure = err as { stdout?: string; stderr?: string; status?: number | null };
    return {
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? "",
      status: failure.status ?? 1,
    };
  }
}

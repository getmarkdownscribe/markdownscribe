import { readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);

// Não-recursiva por design (SPEC-010 §CLI) — pasta lista só os arquivos no
// próprio nível, mesma regra que os scripts PowerShell atuais já seguem
// (exceto mdscribe-fm.ps1 -Recurse, que fica fora de escopo do CLI).
export function collectMarkdownFiles(path: string): string[] {
  const stat = statSync(path);
  if (!stat.isDirectory()) {
    return [path];
  }

  return readdirSync(path)
    .filter((name) => MARKDOWN_EXTENSIONS.has(extname(name).toLowerCase()))
    .map((name) => join(path, name))
    .sort();
}

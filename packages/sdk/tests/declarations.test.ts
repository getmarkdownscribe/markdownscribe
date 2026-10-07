import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// A 0.1.0 foi publicada com `dist/client.d.ts` importando os tipos de
// `@markdownscribe/core`, um pacote interno que nunca existiu no npm. Para
// quem usa TypeScript, todo input e output virava `any` (ou "Cannot find
// module", sem skipLibCheck) — o "cliente tipado" não era tipado.
//
// Este teste lê os .d.ts que vão de fato para o npm e falha se qualquer um
// importar um módulo que o consumidor não terá instalado: tudo que não for
// relativo, `node:` ou dependência declarada no package.json.

const PKG_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(PKG_DIR, "dist");

export function foreignTypeImports(distDir: string, allowed: string[]): string[] {
  const found: string[] = [];
  for (const file of readdirSync(distDir, { recursive: true }) as string[]) {
    if (!file.endsWith(".d.ts")) continue;
    const source = readFileSync(join(distDir, file), "utf8");
    for (const match of source.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
      const spec = match[1]!;
      if (spec.startsWith(".") || spec.startsWith("node:")) continue;
      const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]!;
      if (!allowed.includes(pkg)) found.push(`${file}: ${spec}`);
    }
  }
  return found;
}

describe("declarações publicadas", () => {
  it("dist existe (rode `pnpm build` antes dos testes)", () => {
    expect(existsSync(DIST)).toBe(true);
  });

  it("nenhum .d.ts importa pacote que o consumidor não terá", () => {
    const pkg = JSON.parse(readFileSync(join(PKG_DIR, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    const allowed = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
    ];
    expect(foreignTypeImports(DIST, allowed)).toEqual([]);
  });
});

#!/usr/bin/env node
// SPEC-015 §11 (repositório privado): nenhum hex de marca aparece fora de
// site/shared/brand/. Site e docs usam os tokens (`--ms-*`), nunca o valor.
// Lê as cores de site/shared/brand/tokens.json e procura cada uma, sem
// distinguir maiúsculas, em site/www e site/docs (quando existirem).
// Sai com 1 e lista arquivo:linha de cada ocorrência.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const tokensPath = join(root, "site", "shared", "brand", "tokens.json");
if (!existsSync(tokensPath)) {
  console.error("check-brand-hex: site/shared/brand/tokens.json não existe; rode brand:sync no privado.");
  process.exit(1);
}
const tokens = JSON.parse(readFileSync(tokensPath, "utf8"));
const hexes = new Set();
for (const mode of Object.values(tokens.color)) for (const v of Object.values(mode)) hexes.add(String(v).toUpperCase());
// Branco e preto puros são neutros: não denunciam cor de marca digitada.
hexes.delete("#FFFFFF");
hexes.delete("#000000");

const SKIP = new Set(["node_modules", "dist", ".astro", "brand"]);
const EXT = /\.(astro|css|ts|tsx|js|mjs|md|mdx|json|html|svg)$/;
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXT.test(name)) yield p;
  }
}

const hits = [];
for (const app of ["www", "docs"]) {
  const dir = join(root, "site", app);
  if (!existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      const found = [...hexes].filter((h) => line.toUpperCase().includes(h));
      if (found.length) hits.push(`${relative(root, file)}:${i + 1}: ${found.join(", ")}`);
    });
  }
}

if (hits.length) {
  console.error(`check-brand-hex: ${hits.length} cor(es) de marca digitada(s) fora de site/shared/brand/ — use var(--ms-*):`);
  for (const h of hits) console.error(`  ${h}`);
  process.exit(1);
}
console.log(`check-brand-hex: nenhuma cor de marca digitada fora de site/shared/brand/ (${hexes.size} valores procurados).`);

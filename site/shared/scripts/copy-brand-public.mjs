#!/usr/bin/env node
// Copia favicon, ícones, manifesto e imagem social da marca para a raiz do
// build de um app (www ou docs), DEPOIS do `astro build`. A fonte é
// site/shared/brand/.
//
// O destino é dist/ e não public/ de propósito: o favicon.svg traz os hex da
// marca, e o check-brand-hex.mjs (roda no CI depois do build) varre site/www e
// site/docs pulando só dist/, node_modules/, .astro/ e brand/. Copiado em
// public/, o próprio arquivo da marca reprovaria a guarda. Custo: no
// `astro dev` não há favicon.
//
// Uso: node ../shared/scripts/copy-brand-public.mjs <pasta de saída do app>
import { copyFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PUBLIC_BRAND_FILES } from "../src/head-tags.mjs";

const brandDir = fileURLToPath(new URL("../brand/", import.meta.url));
const target = resolve(process.argv[2] ?? "public");

mkdirSync(target, { recursive: true });
for (const [from, to] of PUBLIC_BRAND_FILES) {
  copyFileSync(join(brandDir, from), join(target, to));
}
console.log(`copy-brand-public: ${PUBLIC_BRAND_FILES.length} arquivos da marca em ${target}`);

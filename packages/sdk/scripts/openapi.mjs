// Tipos do SDK gerados do contrato publico da API.
//
//   node scripts/openapi.mjs sync    baixa o openapi.json publicado e regenera
//                                    src/generated/openapi.ts
//   node scripts/openapi.mjs check   falha (exit 1) se o arquivo versionado
//                                    divergir do publicado, ou se os tipos
//                                    gerados divergirem do arquivo versionado
//
// O openapi.json fica versionado para o build nao depender de rede. O check
// e o que impede o SDK de ficar para tras da API em silencio.

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import openapiTS, { astToString } from "openapi-typescript";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const SPEC_FILE = join(PKG, "openapi.json");
const TYPES_FILE = join(PKG, "src", "generated", "openapi.ts");
const SPEC_URL = process.env.MDSCRIBE_OPENAPI_URL ?? "https://api.markdownscribe.com/openapi.json";

const HEADER =
  "// GERADO por scripts/openapi.mjs a partir de openapi.json. Nao edite a mao:\n" +
  "// rode `pnpm openapi:sync`.\n\n";

async function fetchSpec() {
  const res = await fetch(SPEC_URL);
  if (!res.ok) throw new Error(`GET ${SPEC_URL} -> ${res.status}`);
  return `${JSON.stringify(await res.json(), null, 2)}\n`;
}

async function generate(specText) {
  const ast = await openapiTS(JSON.parse(specText));
  return HEADER + astToString(ast);
}

const mode = process.argv[2];

if (mode === "sync") {
  const spec = await fetchSpec();
  await writeFile(SPEC_FILE, spec);
  await writeFile(TYPES_FILE, await generate(spec));
  console.log(`openapi.json e src/generated/openapi.ts atualizados de ${SPEC_URL}`);
} else if (mode === "check") {
  const local = await readFile(SPEC_FILE, "utf8");
  const problems = [];
  if ((await generate(local)) !== (await readFile(TYPES_FILE, "utf8"))) {
    problems.push("src/generated/openapi.ts nao corresponde a openapi.json");
  }
  try {
    if ((await fetchSpec()) !== local) problems.push(`openapi.json difere do publicado em ${SPEC_URL}`);
  } catch (err) {
    problems.push(`nao foi possivel ler ${SPEC_URL}: ${err.message}`);
  }
  if (problems.length > 0) {
    for (const p of problems) console.error(`openapi:check: ${p}`);
    console.error("Rode `pnpm openapi:sync`, revise o diff e commite.");
    // exitCode, nao exit(): ver scripts/check-canonical.mjs na raiz.
    process.exitCode = 1;
  } else {
    console.log("openapi:check ok");
  }
} else {
  console.error("uso: node scripts/openapi.mjs <sync|check>");
  process.exitCode = 2;
}

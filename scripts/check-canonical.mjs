// Frase canonica: a mesma descricao do produto em todo lugar publico.
//
// A fonte unica e a propria API (`GET /` -> description). Este script compara
// com ela o primeiro paragrafo do README e o `description` dos dois pacotes
// publicados no npm, e falha se qualquer um divergir. Trocar a frase e um
// passo explicito, nunca um descuido de um arquivo so.

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = process.env.MDSCRIBE_URL ?? "https://api.markdownscribe.com";

const res = await fetch(`${API}/`);
// process.exitCode, nunca process.exit(): no Node 24+ no Windows, sair a forca
// logo depois de um fetch derruba o processo numa assercao do libuv.
if (!res.ok) throw new Error(`check-canonical: GET ${API}/ -> ${res.status}`);
const canonical = (await res.json()).description;

const readme = await readFile(join(ROOT, "README.md"), "utf8");
// Primeiro paragrafo depois do H1.
const firstParagraph = readme.split(/\r?\n\r?\n/).find((block) => !block.startsWith("#"))?.trim();

const places = { "README.md (first paragraph)": firstParagraph };
for (const pkg of ["sdk", "cli"]) {
  const json = JSON.parse(await readFile(join(ROOT, "packages", pkg, "package.json"), "utf8"));
  places[`packages/${pkg}/package.json description`] = json.description;
}

const wrong = Object.entries(places).filter(([, text]) => text !== canonical);
if (wrong.length > 0) {
  console.error(`check-canonical: expected\n  ${canonical}`);
  for (const [where, text] of wrong) console.error(`- ${where}:\n  ${text}`);
  process.exitCode = 1;
} else {
  console.log(`check-canonical ok (${Object.keys(places).length} places)`);
}

// Blocos gerados das páginas de operação.
//
// A página de operação é Markdown puro, para o `llms-full.txt` e o `.md` de
// cada página levarem o texto inteiro, como as páginas de erro.
// Dois trechos dela NÃO são escritos à mão:
//   - o exemplo (curl, SDK, CLI e resposta), gerado de src/examples/<operationId>.json,
//     o MESMO arquivo que tests/examples.live.test.ts executa contra a API;
//   - a linha de créditos, gerada do `x-credits` do openapi.json.
// Eles ficam entre marcadores. `--write` regrava; sem argumento, confere e sai
// com 1 se alguma página divergir. tests/operations.test.ts faz a mesma
// conferência no CI: a página nunca mostra exemplo ou preço que não veio da fonte.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const DOCS_ROOT = join(HERE, "..");
export const PAGES_DIR = join(DOCS_ROOT, "src", "content", "docs", "operations");
export const EXAMPLES_DIR = join(DOCS_ROOT, "src", "examples");
const OPENAPI_FILE = join(DOCS_ROOT, "..", "..", "packages", "sdk", "openapi.json");
export const API_BASE = "https://api.markdownscribe.com";

export function loadOpenApi() {
  return JSON.parse(readFileSync(OPENAPI_FILE, "utf8"));
}

/** Operações cobradas do openapi.json, com o slug da página (último trecho do path). */
export function operationsFromOpenApi(doc = loadOpenApi()) {
  const ops = [];
  for (const [path, item] of Object.entries(doc.paths)) {
    for (const [method, op] of Object.entries(item)) {
      if (!op?.operationId || !op["x-credits"]) continue;
      ops.push({ operationId: op.operationId, method, path, slug: path.split("/").pop(), credits: op["x-credits"] });
    }
  }
  return ops;
}

export function loadExample(operationId) {
  return JSON.parse(readFileSync(join(EXAMPLES_DIR, `${operationId}.json`), "utf8"));
}

// Objeto JS legível: chaves que são identificadores vão sem aspas.
function jsLiteral(value, indent = "") {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  const inner = indent + "  ";
  if (Array.isArray(value)) return `[${value.map((v) => jsLiteral(v, inner)).join(", ")}]`;
  const entries = Object.entries(value).map(([k, v]) => {
    const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
    return `${inner}${key}: ${jsLiteral(v, inner)},`;
  });
  return `{\n${entries.join("\n")}\n${indent}}`;
}

// Aspas simples do shell: ' vira '\''.
const shellQuote = (s) => `'${s.replace(/'/g, `'\\''`)}'`;

export function renderExample(ex) {
  const { request, sdk, cli, response, capturedOn, responseNote } = ex;
  const body = JSON.stringify(request.body);
  const lines = [
    "### curl",
    "",
    "```bash",
    `curl ${API_BASE}${request.path} \\`,
    `  -H "X-API-Key: $MDSCRIBE_API_KEY" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d ${shellQuote(body)}`,
    "```",
    "",
    "### TypeScript SDK",
    "",
    "```ts",
    `import { MarkdownScribeClient } from "@markdownscribe/sdk";`,
    "",
    `const client = new MarkdownScribeClient({ apiKey: process.env.MDSCRIBE_API_KEY! });`,
    `const result = await client.${sdk.method}(${jsLiteral(request.body)});`,
    "```",
    "",
    "### CLI",
    "",
  ];
  if (cli.file) lines.push(`Save the \`markdown\` value above as \`${cli.file}\`, then:`, "");
  lines.push("```bash", cli.command, "```", "");
  lines.push("### Response", "");
  lines.push(`Captured from the API on ${capturedOn}.${responseNote ? ` ${responseNote}` : ""}`, "");
  lines.push("```json", JSON.stringify(response, null, 2), "```");
  return lines.join("\n");
}

const plural = (n) => `${n} credit${n === 1 ? "" : "s"}`;

export function renderCredits(credits) {
  let head;
  if (credits.max === null) head = `From ${plural(credits.min)} per call, with no upper limit.`;
  else if (credits.max === credits.min) head = `${plural(credits.min)} per call.`;
  else head = `${credits.min} to ${plural(credits.max)} per call.`;
  const note = credits.note ? ` ${credits.note}` : "";
  // A nota de algumas operações já aponta o header; não repetir.
  const header = /X-Credits-Charged/.test(note) ? "" : " Each response says what it cost in the `X-Credits-Charged` header.";
  return `**${head}**${note}${header} Errors are never charged.`;
}

function replaceBlock(source, kind, operationId, content) {
  const open = `<!-- generated:${kind} ${operationId} -->`;
  const close = `<!-- /generated:${kind} -->`;
  const start = source.indexOf(open);
  const end = source.indexOf(close);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`marcadores ${open} … ${close} ausentes ou fora de ordem`);
  }
  return `${source.slice(0, start + open.length)}\n\n${content}\n\n${source.slice(end)}`;
}

/** Devolve a página com os dois blocos regenerados. */
export function syncPage(source, op, ex = loadExample(op.operationId)) {
  let out = replaceBlock(source, "example", op.operationId, renderExample(ex));
  out = replaceBlock(out, "credits", op.operationId, renderCredits(op.credits));
  return out;
}

export function pageFiles() {
  return readdirSync(PAGES_DIR).filter((f) => f.endsWith(".md"));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes("--write");
  const bySlug = new Map(operationsFromOpenApi().map((o) => [o.slug, o]));
  let drift = 0;
  for (const file of pageFiles()) {
    const op = bySlug.get(file.replace(/\.md$/, ""));
    if (!op) throw new Error(`${file}: nenhuma operação do openapi.json com esse slug`);
    const path = join(PAGES_DIR, file);
    const before = readFileSync(path, "utf8");
    const after = syncPage(before, op);
    if (after === before) continue;
    if (write) {
      writeFileSync(path, after);
      console.log(`regravado: ${file}`);
    } else {
      drift++;
      console.log(`divergente: ${file} (rode com --write)`);
    }
  }
  process.exitCode = drift ? 1 : 0;
}

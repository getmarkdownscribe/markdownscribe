// SPEC-014 §10 (MKD-153): custo de contexto — quantos tokens um agente
// carrega sobre nós antes de fazer qualquer coisa útil.
//
// Pilar 1 da tese de Builder-Led Growth: o que ocupamos na janela do agente
// antes da primeira mensagem do usuário. Quase ninguém mede. Não é
// telemetria: é medição estática dos nossos próprios artefatos, custo zero.
//
// O QUE MEDE (o que um agente lê para descobrir como nos usar):
//   - packages/sdk/openapi.json — o contrato inteiro (identico ao publicado;
//     o openapi:check garante);
//   - a resposta do GET / de descoberta, buscada de verdade em --base-url;
//   - os READMEs publicados no npm (CLI `markdownscribe` e `@markdownscribe/sdk`)
//     e o README deste repositorio (o que o agente le no GitHub);
//   - llms.txt e as descrições de tools do MCP, que ainda NÃO existem: entram
//     com 0 tokens e `present: false`, nunca com número inventado.
//
// TOKENIZADOR: o do Claude não roda offline (a contagem oficial é uma API que
// exige chave). Usamos o `o200k_base` (js-tiktoken) como APROXIMAÇÃO, e a
// saída diz isso. O valor do número está na série histórica e no orçamento,
// que usam sempre o mesmo tokenizador — não no valor absoluto.
//
// SAÍDA: JSON (para virar série histórica) e código 1 se o total passar do
// orçamento. E trava de CI deste repositorio desde a MKD-136, quando saiu do
// monorepo privado: mede so artefatos publicos, entao mora aqui.
//
// Uso:
//   node scripts/context-cost.mjs
//   node scripts/context-cost.mjs --base-url http://localhost:3000
//   CONTEXT_BUDGET_TOKENS=20000 node scripts/context-cost.mjs
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getEncoding } from "js-tiktoken";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Orçamento inicial, escolhido DEPOIS da medição. T0 (2026-10-06): 10.123
// tokens (openapi 8.146, READMEs 1.863, descoberta 114). Orçamento 12.000 =
// folga de ~18%. MKD-136 (2026-10-07): 11.087 — entrou o README deste
// repositorio (788) e os dos pacotes foram a 2.039; a folga caiu para ~8%:
//   - cabe o crescimento normal sem mexer aqui (uma rota nova custa ~600
//     tokens no openapi; ajustes de README, algumas centenas);
//   - morde no inchaço de verdade (schema duplicado, seção prolixa, um
//     artefato novo inteiro).
// Quando llms.txt e as tools do MCP existirem, eles entram no total e o
// orçamento precisa ser revisto DE PROPÓSITO — é para isso que a trava existe.
export const ORCAMENTO_PADRAO = 12_000;

function arg(nome) {
  const i = process.argv.indexOf(nome);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function orcamento() {
  const bruto = process.env.CONTEXT_BUDGET_TOKENS;
  if (bruto === undefined || bruto === "") return ORCAMENTO_PADRAO;
  const n = Number(bruto);
  if (!Number.isInteger(n) || n <= 0) {
    console.error(`[context-cost] CONTEXT_BUDGET_TOKENS inválido: "${bruto}"`);
    return null;
  }
  return n;
}

const enc = getEncoding("o200k_base");
const contar = (texto) => enc.encode(texto).length;

// Arquivo que deveria existir e nao existe e ERRO, nunca 0 tokens: um zero
// silencioso baixa o total e passa na trava — foi o que quase aconteceu quando
// estes READMEs mudaram de repositorio (MKD-136).
class ArtefatoAusente extends Error {}

function arquivo(nome, caminho) {
  const abs = resolve(ROOT, caminho);
  if (!existsSync(abs)) throw new ArtefatoAusente(`${caminho} não existe`);
  const texto = readFileSync(abs, "utf8");
  return { name: nome, source: caminho, present: true, bytes: Buffer.byteLength(texto), tokens: contar(texto) };
}

async function descoberta(baseUrl) {
  const url = `${baseUrl.replace(/\/$/, "")}/`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${url} respondeu ${res.status}`);
  const texto = await res.text();
  return { name: "discovery", source: `GET ${url}`, present: true, bytes: Buffer.byteLength(texto), tokens: contar(texto) };
}

const ausente = (nome, motivo) => ({ name: nome, source: motivo, present: false, bytes: 0, tokens: 0 });

async function main() {
  const baseUrl = arg("--base-url") ?? "https://api.markdownscribe.com";
  const budget = orcamento();
  if (budget === null) return 2;

  let disc;
  try {
    disc = await descoberta(baseUrl);
  } catch (err) {
    // Sem a descoberta o total mentiria para baixo — e um total baixo passa
    // na trava. Melhor falhar do que medir pela metade.
    console.error(`[context-cost] não consegui ler a descoberta: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  let locais;
  try {
    locais = [
      arquivo("openapi", "packages/sdk/openapi.json"),
      arquivo("readme_repo", "README.md"),
      arquivo("readme_cli", "packages/cli/README.md"),
      arquivo("readme_sdk", "packages/sdk/README.md"),
    ];
  } catch (err) {
    if (!(err instanceof ArtefatoAusente)) throw err;
    console.error(`[context-cost] ${err.message} — não meço pela metade`);
    return 2;
  }

  const artifacts = [
    locais[0],
    disc,
    ...locais.slice(1),
    ausente("llms_txt", "ainda não existe (Sprint 12, site)"),
    ausente("mcp_tools", "ainda não existe (Sprint 14, MCP)"),
  ];
  const total = artifacts.reduce((a, x) => a + x.tokens, 0);
  const saida = {
    measured_at: new Date().toISOString(),
    tokenizer: "o200k_base (js-tiktoken) — aproximação; o tokenizador do Claude não roda offline",
    total,
    budget,
    within_budget: total <= budget,
    artifacts,
  };
  console.log(JSON.stringify(saida, null, 2));
  if (total > budget) {
    console.error(`[context-cost] ${total} tokens > orçamento de ${budget}`);
    return 1;
  }
  return 0;
}

// exitCode, e não process.exit(): no Windows, sair à força com o socket do
// fetch ainda fechando derruba o Node numa assertion do libuv e o código de
// saída vira lixo (127) — e uma trava de CI precisa sair com 1, sempre.
process.exitCode = await main();

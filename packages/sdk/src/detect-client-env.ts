// Sprint 11 / MKD-133 (SPEC-011 §"identificação de cliente"): de onde a
// chamada nasceu — agente, qual agente, ou pessoa.
//
// AS FONTES, porque isto é a parte que erra em silêncio se for chutada.
// Um nome de variável errado nunca dispara, e a conclusão vira "ninguém usa
// essa ferramenta" em vez de "nossa detecção está quebrada".
//
//   AGENT=<nome>   Convenção emergente entre agentes: Goose exporta
//                  AGENT=goose, Amp exporta AGENT=amp. Preferida sobre as
//                  específicas justamente por cobrir ferramenta que ainda
//                  não existe, sem exigir release nosso.
//   CLAUDECODE     Verificado EMPIRICAMENTE em 2026-09-22: presente no
//                  ambiente de uma sessão real do Claude Code. Evidência
//                  direta, mais forte que documentação.
//   CURSOR_AGENT   Doc oficial da Cursor: "Use the CURSOR_AGENT environment
//                  variable in your shell config to detect when Cursor is
//                  running". [cursor.com/docs/agent/tools/terminal]
//                  NÃO é CURSOR_TRACE_ID — esse nome, suposto no blueprint,
//                  não existe na doc.
//   CI             GitHub Actions: "Always set to true. You can use this
//                  variable to differentiate when tests are being run
//                  locally or by GitHub Actions."
//
// FORA DE ESCOPO, deliberadamente: **Codex**. Não há sinal confiável — a
// proposta de expor AGENT=codex aos processos filhos foi fechada como "not
// planned" (openai/codex#13416), e o shell_environment_policy permite herdar
// ambiente vazio, então nem um sinal existente chegaria de forma garantida.
// Detectar por heurística daria número errado com cara de número certo.

/** Nome da env var que desliga a detecção por completo. */
export const OPT_OUT_ENV = "MDSCRIBE_NO_CLIENT_ENV";

/**
 * Normaliza um valor vindo do ambiente para algo seguro de virar header HTTP
 * e, depois, coluna de banco: minúsculas, só letras, dígitos e hífen, no
 * máximo 32 caracteres.
 *
 * Existe porque `AGENT` é preenchida por software de terceiro. Sem isto, o
 * ambiente de outra pessoa escreveria valores arbitrários no nosso schema.
 */
function sanitizar(bruto: string | undefined): string | undefined {
  if (typeof bruto !== "string") return undefined;
  const limpo = bruto
    .trim()
    .toLowerCase()
    // Dobra acento antes de filtrar: sem isto, "espaço" vira "espa-o" e
    // "café" vira "caf-". O ambiente pode estar em qualquer idioma, e perder
    // a letra e pior que transliterar.
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
    .replace(/-+$/g, "");
  return limpo.length > 0 ? limpo : undefined;
}

function definida(nome: string): boolean {
  const v = process.env[nome];
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Identifica o ambiente de execução do chamador, ou `undefined` quando não
 * há sinal.
 *
 * `undefined` — e não a string "unknown" — porque ausência é informação:
 * um valor que não informa nada ocupa bytes no header, polui agregação e
 * ainda finge ser dado. Mesma disciplina dos headers de crédito (MKD-132).
 *
 * Precedência: `AGENT` (convenção aberta) → agente nomeado → `CI`. Um agente
 * rodando dentro de um CI é as duas coisas; para taxa de adoção o que
 * interessa é o agente, com `CI` como fallback mais genérico.
 */
export function detectClientEnv(): string | undefined {
  if (definida(OPT_OUT_ENV)) return undefined;

  const declarado = sanitizar(process.env["AGENT"]);
  if (declarado !== undefined) return declarado;

  if (definida("CLAUDECODE")) return "claude-code";
  if (definida("CURSOR_AGENT")) return "cursor";
  if (definida("CI")) return "ci";

  return undefined;
}

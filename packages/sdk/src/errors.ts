// Normaliza as 3 famílias de erro reais encontradas na API (pesquisa da
// Sprint 10/D-037): (A) validação/negócio via toHttpError() — validation,
// payload_too_large, invalid_frontmatter, unauthorized, rate_limited,
// insufficient_credits, not_found, key_limit_reached; (B) o 500 global do
// app.onError — internal; (C) o grupo ad-hoc dos endpoints que dependem do
// serviço Python de extração (mermaid/url-to-md) — timeout,
// service_unavailable, fetch_failed, extraction_empty, invalid_request.
//
// O corpo nunca é forçado num shape rígido demais: campos extras (balance,
// retry_after_seconds, kind, hint, upstream_status, details, ...) continuam
// acessíveis via index signature — o objetivo aqui é sempre expor status/
// request_id de forma confiável, não recusar um corpo que fuja do
// esperado.
// Sprint 11 / MKD-131 (SPEC-011 §4): a API unificou o contrato de erro. Os
// campos abaixo passam a ser garantidos em toda resposta de erro; ficam
// opcionais no tipo porque o SDK precisa continuar aceitando um corpo que
// fuja do esperado (proxy no meio, versão antiga da API) sem explodir.
export interface MarkdownScribeErrorBody {
  error: string;
  request_id?: string;
  /** O que fazer, em uma frase. */
  hint?: string;
  /** Comando que resolve, quando existe (ex.: `mdscribe login`). */
  next_step?: string;
  /** Página do código específico deste erro. */
  docs_url?: string;
  /** Só em 5xx: issue pré-preenchida com o request_id. */
  report_url?: string;
  [key: string]: unknown;
}

function stringField(body: MarkdownScribeErrorBody, key: string): string | undefined {
  const value = body[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export class MarkdownScribeApiError extends Error {
  readonly status: number;
  readonly requestId: string | undefined;
  readonly body: MarkdownScribeErrorBody;
  /** O que fazer, em uma frase (campo `hint` do contrato). */
  readonly hint: string | undefined;
  /** Comando executável que resolve, quando a API sabe de um. */
  readonly nextStep: string | undefined;
  /** Documentação do código deste erro. */
  readonly docsUrl: string | undefined;
  /** Só em 5xx: onde relatar, já com o request_id embutido. */
  readonly reportUrl: string | undefined;

  constructor(status: number, body: MarkdownScribeErrorBody) {
    const hint = stringField(body, "hint");
    // O hint entra na mensagem do Error de propósito: é o texto que aparece
    // num stack trace, num log de CI ou no relato que alguém cola numa issue
    // — e sem ele a mensagem diria só o código, que não ajuda ninguém.
    super(
      `MarkdownScribe API error (${status}): ${body.error ?? "unknown"}${hint ? ` — ${hint}` : ""}`
    );
    this.name = "MarkdownScribeApiError";
    this.status = status;
    this.body = body;
    this.requestId = stringField(body, "request_id");
    this.hint = hint;
    this.nextStep = stringField(body, "next_step");
    this.docsUrl = stringField(body, "docs_url");
    this.reportUrl = stringField(body, "report_url");
  }
}

import type {
  FormatInput,
  FormatOutput,
  FrontmatterInput,
  FrontmatterOutput,
  LintInput,
  LintOutput,
  MermaidInput,
  MermaidOutput,
  TocInput,
  TocOutput,
  UrlToMdInput,
  UrlToMdOutput,
} from "./types.js";
import { detectClientEnv } from "./detect-client-env.js";
import { MarkdownScribeApiError, type MarkdownScribeErrorBody } from "./errors.js";
import { SDK_VERSION } from "./version.js";

export interface MarkdownScribeClientOptions {
  apiKey: string;
  /** Default: {@link DEFAULT_BASE_URL} (https://api.markdownscribe.com) */
  baseUrl?: string;
  /**
   * Prefixo do User-Agent, para um cliente construido EM CIMA deste SDK se
   * identificar (Sprint 11 / MKD-133). O CLI usa
   * `userAgentPrefix: "markdownscribe-cli/<versao>"` e o resultado fica
   * `markdownscribe-cli/0.1.0 markdownscribe-sdk/0.1.0 node/v22...`.
   *
   * Sem isto o CLI seria indistinguivel do SDK em `op_metrics`, e perderiamos
   * justamente a separacao entre "chamada de terminal" e "chamada de codigo".
   */
  userAgentPrefix?: string;
}

/**
 * User-Agent enviado em toda requisicao. Identifica a BIBLIOTECA e o runtime,
 * nunca a pessoa: nao carrega usuario, caminho de arquivo, nome de maquina
 * nem sistema operacional.
 */
export function buildUserAgent(prefix?: string): string {
  const base = `markdownscribe-sdk/${SDK_VERSION} node/${process.version}`;
  return prefix !== undefined && prefix.trim().length > 0
    ? `${prefix.trim()} ${base}`
    : base;
}

export interface ResponseMeta {
  request_id: string;
  duration_ms?: number;
  /** Creditos cobrados por esta chamada. */
  credits: number;
  /**
   * Saldo restante da conta DEPOIS desta chamada, lido do header
   * X-Credits-Remaining (Sprint 11 / MKD-132).
   *
   * Ausente quando a chamada nao foi cobrada — e a ausencia e informacao:
   * nada foi debitado. Nunca e um palpite; a API le o valor na mesma
   * transacao do debito.
   *
   * Serve para decidir ANTES de falhar: um agente que enxerga o saldo cair
   * consegue estimar se a proxima tarefa cabe, em vez de descobrir no 402.
   */
  creditsRemaining?: number;
}

export type WithMeta<T> = T & { meta: ResponseMeta };

// Sprint 11 / MKD-130 (SPEC-013 §10, D-043 §4): domínio próprio como padrão.
// Exportada porque o CLI reusa esta constante (fonte única; a Sprint 10
// tinha uma cópia em cada pacote).
export const DEFAULT_BASE_URL = "https://api.markdownscribe.com";

// Cliente HTTP tipado pras 6 operações REST — mesma auth X-API-Key que a
// API já usa, fetch nativo (Node ≥22, zero dependência de cliente HTTP
// nova). Cada método devolve o `meta` completo da resposta (request_id,
// duration_ms quando existir, credits) sem descartar nada — é o dado que
// ancora a verificação de cobrança (SPEC-010 §7, D-037 §2.5).
export class MarkdownScribeClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly userAgent: string;

  constructor(options: MarkdownScribeClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    // Calculado UMA vez: a versao do SDK e do runtime nao mudam no meio da
    // execucao, e montar a string por requisicao seria trabalho repetido em
    // todo caminho quente.
    this.userAgent = buildUserAgent(options.userAgentPrefix);
  }

  async frontmatter(input: FrontmatterInput): Promise<WithMeta<FrontmatterOutput>> {
    return this.post("/v1/md/frontmatter", input);
  }

  async toc(input: TocInput): Promise<WithMeta<TocOutput>> {
    return this.post("/v1/md/toc", input);
  }

  async format(input: FormatInput): Promise<WithMeta<FormatOutput>> {
    return this.post("/v1/md/format", input);
  }

  async lint(input: LintInput): Promise<WithMeta<LintOutput>> {
    return this.post("/v1/md/lint", input);
  }

  async mermaid(input: MermaidInput): Promise<WithMeta<MermaidOutput>> {
    return this.post("/v1/md/mermaid", input);
  }

  async urlToMd(input: UrlToMdInput): Promise<WithMeta<UrlToMdOutput>> {
    return this.post("/v1/url-to-md", input);
  }

  /**
   * Headers de toda requisicao. O X-Client-Env so entra quando ha sinal —
   * ausencia e informacao, e mandar "unknown" seria ocupar bytes fingindo
   * ser dado (mesma disciplina dos headers de credito, MKD-132).
   */
  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      "X-API-Key": this.apiKey,
      "Content-Type": "application/json",
      "User-Agent": this.userAgent,
    };
    const env = detectClientEnv();
    if (env !== undefined) h["X-Client-Env"] = env;
    return h;
  }

  private async post<T>(path: string, body: unknown): Promise<WithMeta<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      throw new MarkdownScribeApiError(response.status, json as MarkdownScribeErrorBody);
    }

    // O saldo viaja no HEADER, nao no body — o body e montado pela rota,
    // e o debito so acontece depois dela, no middleware de custo. Enxertar
    // no meta aqui e o que evita cada integracao reimplementar esta leitura
    // (e metade esquecer).
    const remainingHeader = response.headers.get("X-Credits-Remaining");
    if (remainingHeader !== null) {
      const remaining = Number(remainingHeader);
      if (Number.isFinite(remaining)) {
        const meta = json["meta"];
        if (typeof meta === "object" && meta !== null) {
          (meta as Record<string, unknown>)["creditsRemaining"] = remaining;
        }
      }
    }

    return json as WithMeta<T>;
  }
}

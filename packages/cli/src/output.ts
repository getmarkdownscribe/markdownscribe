import { MarkdownScribeApiError } from "@markdownscribe/sdk";

// Sprint 11 / MKD-132: o limiar existe para o aviso chegar ENQUANTO ainda da
// pra agir. Avisar no 402 e avisar depois da falha. 500 creditos sao ~500
// operacoes baratas: folga suficiente pra terminar a tarefa em andamento e
// recarregar sem susto, sem ser tao alto que vire ruido em toda chamada.
export const LOW_BALANCE_THRESHOLD = 500;

/**
 * Linha de aviso quando o saldo fica baixo, ou `null` quando nao ha o que
 * avisar. Vai pro stderr: stdout e o resultado da operacao, e quem faz pipe
 * do resultado nao pode receber aviso no meio do dado.
 */
export function lowBalanceWarning(remaining: number | undefined): string | null {
  if (remaining === undefined || remaining >= LOW_BALANCE_THRESHOLD) return null;
  return (
    `warning: ${remaining} credits left — buy more at https://dashboard.markdownscribe.com
`
  );
}

export function isTty(stream: NodeJS.WriteStream, jsonFlag: boolean): boolean {
  if (jsonFlag) return false;
  return Boolean(stream.isTTY);
}

export interface FormattedError {
  exitCode: number;
  message: string;
}

// Mapeia as 3 famílias de erro reais da API (toHttpError-shaped,
// app.onError 500, e o grupo ad-hoc do serviço de extração — pesquisa do
// D-037) pro contrato de exit code do CLI (SPEC-010 §CLI, 0-7). balance e
// retry_after_seconds precisam sobreviver na mensagem — são o dado que
// ancora a verificação de cobrança (blueprint §2.5.2).
export function formatError(err: MarkdownScribeApiError): FormattedError {
  const detail = errorDetail(err);

  switch (err.status) {
    case 401:
      return { exitCode: 2, message: `Authentication failed: ${detail}` };
    case 402:
      return { exitCode: 3, message: `Insufficient credits (balance: ${err.body["balance"]}): ${detail}` };
    case 429:
      return {
        exitCode: 4,
        message: `Rate limited (retry after ${err.body["retry_after_seconds"]}s): ${detail}`,
      };
    case 400:
    case 413:
    case 422:
      return { exitCode: 5, message: `Invalid request: ${detail}` };
    case 503:
    case 504:
    case 424:
      return { exitCode: 6, message: `Upstream service unavailable: ${detail}` };
    case 404:
      return { exitCode: 7, message: `Not found: ${detail}` };
    default:
      return { exitCode: 1, message: `MarkdownScribe error: ${detail}` };
  }
}

function errorDetail(err: MarkdownScribeApiError): string {
  const head = err.hint ? `${err.body.error} — ${err.hint}` : err.body.error;

  // Sprint 11 / MKD-131 (SPEC-011 §4): o que a API acrescentou ao contrato só
  // vale se chegar aos olhos de quem lê o stderr. As três linhas abaixo são,
  // em ordem de utilidade: o comando que resolve (um agente com shell pode
  // executá-lo sozinho), onde relatar (só em 5xx, quando a culpa é nossa) e a
  // documentação do código. Cada uma só aparece se a API tiver mandado.
  const tail: string[] = [];
  if (err.nextStep) tail.push(`Try: ${err.nextStep}`);
  if (err.reportUrl) tail.push(`Report it: ${err.reportUrl}`);
  if (err.docsUrl) tail.push(`Docs: ${err.docsUrl}`);
  // O que se cola num relato de bug: o id que acha esta chamada nos logs.
  if (err.requestId) tail.push(`request_id: ${err.requestId}`);

  return tail.length > 0 ? `${head}\n  ${tail.join("\n  ")}` : head;
}

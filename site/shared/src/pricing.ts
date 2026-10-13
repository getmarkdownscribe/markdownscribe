// Preços e créditos que o site e as docs mostram (D-047 §5).
//
// Créditos por operação NÃO são digitados aqui: vêm do `x-credits` do
// openapi.json, o mesmo número que a API cobra. Os planos são o único literal,
// porque a API não os publica; vêm da D-040 e são conferidos contra a Stripe
// live no fechamento da sprint (história K).
import { OPENAPI, type CreditCost } from "./openapi.js";

export const PLANS = {
  currency: "USD",
  /** Concedidos uma vez no cadastro; não se renovam (D-038). */
  signup: { credits: 2_000, priceUsd: 0 },
  /** Pacote avulso; os créditos não expiram (D-040). */
  pack: { credits: 5_000, priceUsd: 5, expires: false },
  /** Assinatura mensal; os créditos expiram na renovação (D-033 §5, D-040). */
  monthly: { credits: 15_000, priceUsd: 9, expires: true },
} as const;

// Hierarquia da D-046 §2: as duas que exigem navegador abrem a lista; as
// quatro baratas vêm depois, como gancho.
const ORDER = [
  "convertUrlToMarkdown",
  "renderMermaid",
  "formatMarkdown",
  "lintMarkdown",
  "buildToc",
  "parseFrontmatter",
];

export interface OperationInfo {
  operationId: string;
  path: string;
  summary: string;
  credits: CreditCost;
}

export function operations(): OperationInfo[] {
  const found: OperationInfo[] = [];
  for (const [path, item] of Object.entries(OPENAPI.paths)) {
    for (const op of Object.values(item)) {
      if (op?.operationId === undefined || op["x-credits"] === undefined) continue;
      found.push({
        operationId: op.operationId,
        path,
        summary: op.summary ?? "",
        credits: op["x-credits"],
      });
    }
  }
  const rank = (id: string) => {
    const i = ORDER.indexOf(id);
    // Operação nova que ninguém posicionou vai para o fim, mas aparece.
    return i === -1 ? ORDER.length : i;
  };
  return found.sort((a, b) => rank(a.operationId) - rank(b.operationId));
}

export function creditsFor(operationId: string): CreditCost {
  const op = operations().find((o) => o.operationId === operationId);
  if (op === undefined) {
    throw new Error(`creditsFor: operationId "${operationId}" não existe no openapi.json`);
  }
  return op.credits;
}

// O documento OpenAPI que o SDK usa e que o `openapi:check` mantém igual ao
// publicado em https://api.markdownscribe.com/openapi.json.
//
// Importado como JSON, e não lido com `readFileSync`: no build do Astro este
// módulo vira um chunk empacotado, e um caminho relativo ao arquivo-fonte
// deixaria de apontar para o lugar certo. O Vite embute o JSON no build.
import doc from "../../../packages/sdk/openapi.json" with { type: "json" };

export interface CreditCost {
  min: number;
  max: number | null;
  note?: string;
}

interface Operation {
  operationId?: string;
  summary?: string;
  "x-credits"?: CreditCost;
}

interface OpenApiDoc {
  paths: Record<string, Partial<Record<"get" | "post", Operation>>>;
  components: { schemas?: Record<string, { enum?: string[] }> };
}

export const OPENAPI = doc as unknown as OpenApiDoc;

// Códigos de erro com página em docs.markdownscribe.com/errors/<código>.
//
// Vêm do enum `components.schemas.ErrorCode` do openapi.json (MKD-168), que a
// API gera do próprio catálogo. Toda resposta de erro aponta para uma dessas
// páginas pelo `docs_url`; código sem página é link morto para o agente.
import { OPENAPI } from "./openapi.js";

export function errorCodes(): string[] {
  const values = OPENAPI.components.schemas?.["ErrorCode"]?.enum;
  if (values === undefined || values.length === 0) {
    throw new Error("errorCodes: openapi.json sem components.schemas.ErrorCode; rode `pnpm openapi:sync`");
  }
  return [...values];
}

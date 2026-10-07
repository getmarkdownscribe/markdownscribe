// Tipos de entrada e saida das 6 operacoes, derivados do contrato publico
// (openapi.json -> src/generated/openapi.ts). Nenhum tipo e escrito a mao:
// se a API mudar, `pnpm openapi:check` acusa e `pnpm openapi:sync` regenera.
//
// A 0.1.0 importava estes tipos de um pacote interno que nunca foi
// publicado, e o consumidor recebia `any`. Derivar do OpenAPI resolve isso
// sem dependencia nova em tempo de execucao: o arquivo gerado so tem tipos.
import type { operations } from "./generated/openapi.js";

type Op =
  | "parseFrontmatter"
  | "buildToc"
  | "lintMarkdown"
  | "formatMarkdown"
  | "renderMermaid"
  | "convertUrlToMarkdown";

type RequestBody<O extends Op> = NonNullable<
  operations[O]["requestBody"]
>["content"]["application/json"];

// `meta` sai do corpo porque o SDK devolve uma versao mais rica dele
// (ResponseMeta, com creditsRemaining lido do header).
type SuccessBody<O extends Op> = Omit<
  operations[O]["responses"][200]["content"]["application/json"],
  "meta"
>;

export type FrontmatterInput = RequestBody<"parseFrontmatter">;
export type FrontmatterOutput = SuccessBody<"parseFrontmatter">;
export type TocInput = RequestBody<"buildToc">;
export type TocOutput = SuccessBody<"buildToc">;
export type LintInput = RequestBody<"lintMarkdown">;
export type LintOutput = SuccessBody<"lintMarkdown">;
export type FormatInput = RequestBody<"formatMarkdown">;
export type FormatOutput = SuccessBody<"formatMarkdown">;
export type MermaidInput = RequestBody<"renderMermaid">;
export type MermaidOutput = SuccessBody<"renderMermaid">;
export type UrlToMdInput = RequestBody<"convertUrlToMarkdown">;
export type UrlToMdOutput = SuccessBody<"convertUrlToMarkdown">;

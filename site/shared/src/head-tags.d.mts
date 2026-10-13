// Tipos de head-tags.mjs. O módulo é JavaScript porque o astro.config.mjs das
// docs o importa direto no Node; as páginas Astro e o Starlight precisam dos
// tipos, e o `head` do Starlight só aceita tag literal.
export interface HeadTag {
  tag: "link" | "meta";
  attrs: Record<string, string>;
}

export function parseHeadTags(html: string): HeadTag[];
export function brandHeadTags(): HeadTag[];
export const PUBLIC_BRAND_FILES: ReadonlyArray<readonly [from: string, to: string]>;

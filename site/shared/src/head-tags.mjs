// As tags de favicon, manifesto e theme-color da marca, lidas de
// brand/favicon/head.html (cópia gerada) e devolvidas como objetos.
//
// Lidas, e não copiadas para o código de www/docs, por dois motivos: a marca
// muda o arquivo por sync sem que ninguém precise reescrever o <head>; e o
// theme-color carrega um hex de marca que a guarda check-brand-hex.mjs
// proíbe dentro de site/www e site/docs.
//
// Formato de saída = o que o Starlight aceita em `head` ({ tag, attrs }).
//
// Duas entradas, porque há dois contextos:
// - página Astro (empacotada pelo Vite): importa o arquivo com `?raw` e
//   chama `parseHeadTags(html)`. Ler por caminho ali quebra, porque o módulo
//   vira um chunk em dist/ e o caminho relativo deixa de apontar para brand/;
// - astro.config.mjs (Node puro, sem empacotar): `brandHeadTags()` lê o
//   arquivo direto.
import { readFileSync } from "node:fs";

const TAG = /<(link|meta)\s+([^>]*?)\s*\/?>/g;
const ATTR = /([a-zA-Z:-]+)="([^"]*)"/g;

/** @typedef {import("./head-tags.d.mts").HeadTag} HeadTag */

/**
 * @param {string} html
 * @returns {HeadTag[]}
 */
export function parseHeadTags(html) {
  /** @type {HeadTag[]} */
  const tags = [];
  for (const [, tag, rawAttrs] of html.matchAll(TAG)) {
    /** @type {Record<string, string>} */
    const attrs = {};
    for (const [, name, value] of rawAttrs.matchAll(ATTR)) attrs[name] = value;
    // O regex TAG só casa `link` ou `meta`.
    tags.push({ tag: /** @type {"link" | "meta"} */ (tag), attrs });
  }
  if (tags.length === 0) throw new Error("parseHeadTags: head.html sem nenhuma tag <link> ou <meta>");
  return tags;
}

/** @returns {HeadTag[]} */
export function brandHeadTags() {
  return parseHeadTags(readFileSync(new URL("../brand/favicon/head.html", import.meta.url), "utf8"));
}

// Os arquivos que as tags acima referenciam e que precisam estar na raiz
// pública de cada app. Copiados no build por copy-brand-public.mjs.
export const PUBLIC_BRAND_FILES = [
  ["favicon/favicon.ico", "favicon.ico"],
  ["favicon/favicon.svg", "favicon.svg"],
  ["favicon/apple-touch-icon.png", "apple-touch-icon.png"],
  ["favicon/icon-192.png", "icon-192.png"],
  ["favicon/icon-512.png", "icon-512.png"],
  ["favicon/site.webmanifest", "site.webmanifest"],
  ["og/og-default.png", "og-default.png"],
];

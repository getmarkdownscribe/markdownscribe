import { describe, expect, it } from "vitest";

import { PUBLIC_BRAND_FILES, brandHeadTags } from "../src/head-tags.mjs";

// MKD-169: o <head> de www e docs vem de brand/favicon/head.html. Se a marca
// trocar o arquivo e uma tag passar a citar um arquivo que não copiamos para
// public/, o favicon quebra em produção sem nenhum erro de build. Este teste
// fecha essa porta.

describe("tags de favicon e manifesto lidas da marca", () => {
  const tags = brandHeadTags();

  it("traz ícones, apple-touch-icon, manifesto e theme-color", () => {
    const rels = tags.filter((t) => t.tag === "link").map((t) => t.attrs["rel"]);
    expect(rels).toEqual(expect.arrayContaining(["icon", "apple-touch-icon", "manifest"]));
    expect(tags.some((t) => t.tag === "meta" && t.attrs["name"] === "theme-color")).toBe(true);
  });

  it("todo arquivo citado por uma tag é copiado para a raiz pública", () => {
    const copiados = new Set(PUBLIC_BRAND_FILES.map(([, to]) => `/${to}`));
    const citados = tags.map((t) => t.attrs["href"]).filter((h): h is string => h !== undefined);
    expect(citados.length).toBeGreaterThan(0);
    for (const href of citados) expect(copiados, href).toContain(href);
  });
});

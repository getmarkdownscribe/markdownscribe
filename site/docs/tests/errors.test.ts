import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { errorCodes } from "@markdownscribe/site-shared/error-codes";

// MKD-170 (D-046 §6, D-047 §5): toda resposta de erro da API traz
// `docs_url = https://docs.markdownscribe.com/errors/<código>`. Este teste lê
// o site JÁ CONSTRUÍDO e exige uma página por código do enum ErrorCode do
// openapi.json, nenhuma a mais, cada uma com o código no H1 (é o que o
// verificador de URLs da história I procura em produção).
//
// Roda depois do `astro build` (o CI constrói antes de testar).

const DIST = join(__dirname, "..", "dist");
const ERRORS_DIR = join(DIST, "errors");

describe("uma página por código de erro da API", () => {
  it("o build existe", () => {
    expect(existsSync(DIST), "rode `pnpm --filter @markdownscribe/site-docs build` antes").toBe(true);
  });

  const codes = errorCodes();

  it("toda página errors/<código> existe e nenhuma sobra", () => {
    const pages = existsSync(ERRORS_DIR)
      ? readdirSync(ERRORS_DIR, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
      : [];
    expect(new Set(pages)).toEqual(new Set(codes));
  });

  it.each(codes)("errors/%s tem o código no H1", (code) => {
    const file = join(ERRORS_DIR, code, "index.html");
    expect(existsSync(file), `${code}: página ausente`).toBe(true);
    const html = readFileSync(file, "utf8");
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, "").trim();
    expect(h1).toBe(code);
  });

  it("o índice errors/ lista e linka todo código", () => {
    const index = join(ERRORS_DIR, "index.html");
    expect(existsSync(index), "errors/index.html ausente").toBe(true);
    const html = readFileSync(index, "utf8");
    for (const code of codes) expect(html, code).toContain(`href="/errors/${code}/"`);
  });

  it.each(codes)("errors/%s diz o status HTTP, o que fazer e mostra uma resposta", (code) => {
    const file = join(ERRORS_DIR, code, "index.html");
    if (!existsSync(file)) return; // o teste anterior já falha
    const html = readFileSync(file, "utf8");
    expect(html).toMatch(/HTTP status/);
    expect(html).toMatch(/id="what-to-do"/);
    expect(html).toContain(`errors/${code}`);
  });
});

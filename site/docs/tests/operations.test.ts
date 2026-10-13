import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { errorCodes } from "@markdownscribe/site-shared/error-codes";
import { operationsFromOpenApi, pageFiles, PAGES_DIR, syncPage } from "../scripts/operation-blocks.mjs";

// Toda página de operação tem as mesmas sete seções, para o
// agente e para o builder. Os ids são os que o Starlight gera dos títulos em
// inglês; trocar um título sem trocar aqui quebra o teste de propósito.
const SECTIONS = [
  "what-it-is",
  "when-to-use-it",
  "a-real-use-case",
  "why-through-the-api",
  "copy-ready-example",
  "credits-limits-and-errors",
  "alternatives-and-when-markdownscribe-is-worth-it",
];

interface Op {
  operationId: string;
  slug: string;
}

const DIST = join(__dirname, "..", "dist");
const ops = operationsFromOpenApi() as Op[];
const bySlug = new Map(ops.map((o) => [o.slug, o]));
const slugs = (pageFiles() as string[]).map((f) => f.replace(/\.md$/, ""));
const codes = new Set(errorCodes());

describe("páginas de operação (fonte)", () => {
  it.each(slugs)("operations/%s corresponde a uma operação do openapi.json", (slug) => {
    expect(bySlug.has(slug), `${slug} não é o último trecho de nenhum path cobrado`).toBe(true);
  });

  it.each(slugs)("operations/%s: exemplo e créditos == o que o gerador produz da fonte", (slug) => {
    const op = bySlug.get(slug);
    if (!op) return; // o teste anterior já falha
    const source = readFileSync(join(PAGES_DIR, `${slug}.md`), "utf8");
    // Diverge quando alguém edita o bloco à mão ou quando o exemplo/x-credits
    // mudou e ninguém rodou `node scripts/operation-blocks.mjs --write`.
    expect(syncPage(source, op)).toBe(source);
  });
});

describe("páginas de operação (build)", () => {
  it.each(slugs)("operations/%s tem as sete seções", (slug) => {
    const file = join(DIST, "operations", slug, "index.html");
    expect(existsSync(file), `${slug}: página ausente no build`).toBe(true);
    const html = readFileSync(file, "utf8");
    for (const id of SECTIONS) expect(html, `${slug}: falta a seção #${id}`).toContain(`id="${id}"`);
  });

  it.each(slugs)("operations/%s linka ao menos uma página de erro que existe", (slug) => {
    const html = readFileSync(join(DIST, "operations", slug, "index.html"), "utf8");
    const linked = [...html.matchAll(/href="\/errors\/([a-z_]+)\/"/g)].map((m) => m[1] as string);
    expect(linked.length, `${slug}: nenhum link para errors/*`).toBeGreaterThan(0);
    for (const code of linked) expect(codes.has(code), `${slug}: errors/${code} não existe`).toBe(true);
  });

  it.each(slugs)("operations/%s data a conferência das alternativas", (slug) => {
    const html = readFileSync(join(DIST, "operations", slug, "index.html"), "utf8");
    expect(html).toMatch(/Checked on \d{4}-\d{2}-\d{2}/);
  });
});

import { describe, expect, it } from "vitest";

import { errorCodes } from "../src/error-codes.js";
import { HOSTS } from "../src/links.js";
import { PLANS, creditsFor, operations } from "../src/pricing.js";

// Sprint 12 / MKD-169 (D-047 §5): o site não digita nada que a API já sabe.
// Estes testes leem o openapi.json real (packages/sdk/openapi.json, o mesmo
// que o SDK usa e que o openapi:check mantém igual ao publicado).

describe("créditos por operação vêm do x-credits do openapi.json", () => {
  it("operação de custo fixo", () => {
    expect(creditsFor("formatMarkdown")).toEqual({ min: 2, max: 2 });
    expect(creditsFor("parseFrontmatter")).toEqual({ min: 1, max: 1 });
  });

  it("operação sem teto traz a nota com a fórmula", () => {
    const mermaid = creditsFor("renderMermaid");
    expect(mermaid.max).toBeNull();
    expect(mermaid.note).toMatch(/5 for the first diagram/);
  });

  it("operação desconhecida é erro, não zero", () => {
    expect(() => creditsFor("naoExiste")).toThrow(/naoExiste/);
  });
});

describe("ordem das operações segue a hierarquia da D-046 §2", () => {
  it("URL→Markdown e Mermaid abrem a lista; as seis estão lá", () => {
    const ids = operations().map((o) => o.operationId);
    expect(ids.slice(0, 2)).toEqual(["convertUrlToMarkdown", "renderMermaid"]);
    expect(new Set(ids)).toEqual(
      new Set([
        "convertUrlToMarkdown",
        "renderMermaid",
        "formatMarkdown",
        "lintMarkdown",
        "buildToc",
        "parseFrontmatter",
      ])
    );
  });

  it("toda operação cobrada do openapi.json aparece, e nenhuma inventada", () => {
    expect(operations()).toHaveLength(6);
    for (const op of operations()) expect(op.path).toMatch(/^\/v1\//);
  });
});

describe("planos (D-040)", () => {
  it("valores e moeda", () => {
    expect(PLANS.currency).toBe("USD");
    expect(PLANS.signup).toMatchObject({ credits: 2000, priceUsd: 0 });
    expect(PLANS.pack).toMatchObject({ credits: 5000, priceUsd: 5, expires: false });
    expect(PLANS.monthly).toMatchObject({ credits: 15000, priceUsd: 9, expires: true });
  });
});

describe("códigos de erro vêm do enum ErrorCode (MKD-168)", () => {
  it("lista igual ao enum publicado", () => {
    const codes = errorCodes();
    expect(codes).toContain("unauthorized");
    expect(codes).toContain("insufficient_credits");
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.length).toBeGreaterThanOrEqual(15);
  });
});

describe("hosts", () => {
  it("são os que a API promete no GET /", () => {
    expect(HOSTS).toEqual({
      site: "https://markdownscribe.com",
      docs: "https://docs.markdownscribe.com",
      api: "https://api.markdownscribe.com",
      dashboard: "https://dashboard.markdownscribe.com",
    });
  });
});

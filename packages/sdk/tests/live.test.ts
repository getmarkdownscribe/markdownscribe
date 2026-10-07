import { describe, expect, it } from "vitest";

import { DEFAULT_BASE_URL, MarkdownScribeApiError, MarkdownScribeClient } from "../src/index.js";

// Chamadas REAIS a api.markdownscribe.com (ou a MDSCRIBE_URL), com a chave em
// MDSCRIBE_API_KEY. Cada execucao custa poucos creditos da chave de CI.
//
// Sem chave (clone local, PR de fork), a suite pula com aviso. No CI do
// repositorio principal, MDSCRIBE_REQUIRE_LIVE=1 transforma a falta da chave
// em falha: teste que so pula nao protege nada.
const API_KEY = process.env["MDSCRIBE_API_KEY"];
const BASE_URL = process.env["MDSCRIBE_URL"] ?? DEFAULT_BASE_URL;

if (!API_KEY) {
  if (process.env["MDSCRIBE_REQUIRE_LIVE"] === "1") {
    throw new Error("MDSCRIBE_REQUIRE_LIVE=1 but MDSCRIBE_API_KEY is not set: live tests cannot run.");
  }
  // stderr direto: o vitest engole console.* de arquivo cujos testes pularam.
  process.stderr.write("[live] MDSCRIBE_API_KEY not set: skipping live API tests.\n");
}

describe.skipIf(!API_KEY)("SDK contra a API real", () => {
  const client = () => new MarkdownScribeClient({ apiKey: API_KEY!, baseUrl: BASE_URL });

  it("frontmatter: devolve o YAML parseado e o meta da cobrança", async () => {
    const result = await client().frontmatter({
      markdown: "---\ntitle: live test\ntags: [sdk, ci]\n---\n\n# Body\n",
    });

    expect(result.frontmatter).toEqual({ title: "live test", tags: ["sdk", "ci"] });
    expect(result.body).toContain("# Body");
    expect(result.meta.request_id).toMatch(/\S+/);
    expect(result.meta.credits).toBe(1);
    expect(typeof result.meta.creditsRemaining).toBe("number");
  }, 30_000);

  it("o saldo cai exatamente o custo da chamada — lint custa 2", async () => {
    const antes = await client().frontmatter({ markdown: "# a\n" });
    const lint = await client().lint({ markdown: "#  title\n\n\n\ntext\n" });

    expect(lint.meta.credits).toBe(2);
    expect(lint.meta.creditsRemaining).toBe(antes.meta.creditsRemaining! - lint.meta.credits);
  }, 30_000);

  it("chave inválida: 401 com o contrato de erro (hint, next_step, request_id)", async () => {
    const bad = new MarkdownScribeClient({ apiKey: "mdsk_invalid_live_test", baseUrl: BASE_URL });

    const err = await bad.frontmatter({ markdown: "# a\n" }).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(MarkdownScribeApiError);
    const apiErr = err as MarkdownScribeApiError;
    expect(apiErr.status).toBe(401);
    expect(apiErr.hint).toMatch(/\S+/);
    expect(apiErr.nextStep).toMatch(/\S+/);
    expect(apiErr.requestId).toMatch(/\S+/);
  }, 30_000);
});

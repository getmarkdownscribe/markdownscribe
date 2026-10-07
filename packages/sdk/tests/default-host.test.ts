import { describe, expect, it } from "vitest";

import {
  DEFAULT_BASE_URL,
  MarkdownScribeApiError,
  MarkdownScribeClient,
} from "../src/index.js";

// Sprint 11 / MKD-130 (SPEC-013 §10, D-043 §4): o SDK passa a apontar por
// padrão para o domínio próprio, e o CLI reusa esta mesma constante (fonte
// única — evita a dispersão de dois defaults que a Sprint 10 deixou).
//
// O segundo teste é uma chamada REAL ao host padrão (Article II): prova que
// o domínio existe, tem TLS válido e chega na API (GET /health é público).
// Nasceu RED em 2026-09-19: o custom domain ainda estava em
// CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP no Railway.
describe("DEFAULT_BASE_URL", () => {
  it("é o domínio próprio, não o host do Railway", () => {
    expect(DEFAULT_BASE_URL).toBe("https://api.markdownscribe.com");
    expect(DEFAULT_BASE_URL).not.toContain("railway.app");
  });

  it("GET /health no host padrão responde 200 com status ok (chamada real)", async () => {
    const res = await fetch(`${DEFAULT_BASE_URL}/health`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status?: string };
    expect(body.status).toBe("ok");
  }, 20_000);
});

// Sprint 11 / MKD-131: o contrato de erro precisa ser provado de ponta a ponta,
// não só num objeto montado no teste. Aqui o SDK chama a API REAL em produção
// com uma chave inválida e confere que os campos chegam tipados até quem
// programa contra ele. Não precisa de banco nem de chave válida: 401 é a
// resposta de um agente que ainda não tem credencial — exatamente o caso que
// o `next_step` existe para resolver.
describe("MarkdownScribeApiError — contrato ponta a ponta contra a API real", () => {
  it("chave inválida no host padrão devolve hint, nextStep e docsUrl", async () => {
    const client = new MarkdownScribeClient({ apiKey: `mdsk_${"00".repeat(32)}` });

    await expect(client.frontmatter({ markdown: "# hi" })).rejects.toThrow(
      MarkdownScribeApiError
    );

    const err = await client.frontmatter({ markdown: "# hi" }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(MarkdownScribeApiError);
    const apiErr = err as InstanceType<typeof MarkdownScribeApiError>;

    expect(apiErr.status).toBe(401);
    expect(apiErr.body.error).toBe("unauthorized");
    expect(apiErr.hint).toBeTruthy();
    expect(apiErr.nextStep).toBe("mdscribe login");
    expect(apiErr.docsUrl).toBe("https://docs.markdownscribe.com/errors/unauthorized");
    expect(apiErr.requestId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    // 4xx é responsabilidade do chamador: não oferecemos canal de relato.
    expect(apiErr.reportUrl).toBeUndefined();
  }, 30_000);
});

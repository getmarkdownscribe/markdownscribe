import { describe, expect, it } from "vitest";

import { MarkdownScribeApiError } from "../src/index.js";

// Sprint 11 / MKD-131 (SPEC-011 §4): a API passou a devolver um contrato de
// erro único. O SDK precisa expor os campos que fazem esse contrato valer a
// pena, como propriedades tipadas — não escondidos dentro de `body`, onde só
// quem já sabe que existem vai procurar.
//
// `nextStep` é o mais importante dos quatro: é o comando que resolve. Um
// agente que recebe 401 e enxerga `error.nextStep === "mdscribe login"` tem o
// que fazer; um que recebe só `error: "unauthorized"` desiste (parte 4 da
// série — o caminho precisa ser estimável).

describe("MarkdownScribeApiError — campos do contrato", () => {
  const body = {
    error: "unauthorized",
    hint: "Send a valid API key in the X-API-Key header.",
    next_step: "mdscribe login",
    docs_url: "https://docs.markdownscribe.com/errors/unauthorized",
    request_id: "01JBQ8Z5R7X9K2M4N6P8Q0S2T4",
  };

  it("expõe hint, nextStep, docsUrl e requestId como propriedades", () => {
    const err = new MarkdownScribeApiError(401, body);

    expect(err.hint).toBe(body.hint);
    expect(err.nextStep).toBe("mdscribe login");
    expect(err.docsUrl).toBe(body.docs_url);
    expect(err.requestId).toBe(body.request_id);
    expect(err.status).toBe(401);
  });

  it("a mensagem do Error carrega o hint — é o que aparece num stack trace", () => {
    const err = new MarkdownScribeApiError(401, body);
    expect(err.message).toContain("unauthorized");
    expect(err.message).toContain(body.hint);
  });

  it("corpo sem os campos novos não quebra (API antiga ou erro inesperado)", () => {
    const err = new MarkdownScribeApiError(500, { error: "internal" });

    expect(err.hint).toBeUndefined();
    expect(err.nextStep).toBeUndefined();
    expect(err.docsUrl).toBeUndefined();
    expect(err.requestId).toBeUndefined();
    expect(err.message).toContain("internal");
  });

  it("reportUrl aparece nos 5xx e o body cru continua acessível", () => {
    const err = new MarkdownScribeApiError(503, {
      error: "service_unavailable",
      hint: "Try again shortly.",
      kind: "render_service_unavailable",
      report_url: "https://github.com/markdownscribe/markdownscribe/issues/new?body=x",
      request_id: "01JBQ8Z5R7X9K2M4N6P8Q0S2T4",
    });

    expect(err.reportUrl).toContain("issues/new");
    expect(err.body["kind"]).toBe("render_service_unavailable");
  });
});

import { describe, expect, it } from "vitest";

import { isTty, formatError } from "../src/output.js";
import { MarkdownScribeApiError } from "@markdownscribe/sdk";

// SPEC-010 §CLI: detecção TTY decide humano vs JSON (--json força JSON mesmo
// em TTY); formatError() mapeia cada família de erro real da API pro exit
// code certo (2/3/4/5/6/7) sem perder campos como balance/retry_after_seconds
// na mensagem — perder esses campos quebraria a verificação de cobrança
// (§2.5 do blueprint).
describe("isTty", () => {
  it("returns true when stream.isTTY is true and --json was not forced", () => {
    expect(isTty({ isTTY: true } as NodeJS.WriteStream, false)).toBe(true);
  });

  it("returns false when stream.isTTY is false", () => {
    expect(isTty({ isTTY: false } as NodeJS.WriteStream, false)).toBe(false);
  });

  it("returns false when --json is forced even if stream.isTTY is true", () => {
    expect(isTty({ isTTY: true } as NodeJS.WriteStream, true)).toBe(false);
  });
});

describe("formatError", () => {
  function err(status: number, body: Record<string, unknown>): MarkdownScribeApiError {
    return new MarkdownScribeApiError(status, { error: "test_error", ...body });
  }

  it("maps 401 to exit code 2", () => {
    const result = formatError(err(401, { error: "unauthorized" }));
    expect(result.exitCode).toBe(2);
  });

  it("maps 402 to exit code 3 and preserves balance in the message", () => {
    const result = formatError(err(402, { error: "insufficient_credits", balance: 3 }));
    expect(result.exitCode).toBe(3);
    expect(result.message).toMatch(/3/);
  });

  it("maps 429 to exit code 4 and preserves retry_after_seconds in the message", () => {
    const result = formatError(err(429, { error: "rate_limited", retry_after_seconds: 17 }));
    expect(result.exitCode).toBe(4);
    expect(result.message).toMatch(/17/);
  });

  it("maps 400 to exit code 5", () => {
    expect(formatError(err(400, { error: "validation" })).exitCode).toBe(5);
  });

  it("maps 413 to exit code 5", () => {
    expect(formatError(err(413, { error: "payload_too_large" })).exitCode).toBe(5);
  });

  it("maps 422 to exit code 5", () => {
    expect(formatError(err(422, { error: "invalid_frontmatter" })).exitCode).toBe(5);
  });

  it("maps 503 to exit code 6", () => {
    expect(formatError(err(503, { error: "service_unavailable" })).exitCode).toBe(6);
  });

  it("maps 504 to exit code 6", () => {
    expect(formatError(err(504, { error: "timeout" })).exitCode).toBe(6);
  });

  it("maps 424 to exit code 6", () => {
    expect(formatError(err(424, { error: "fetch_failed" })).exitCode).toBe(6);
  });

  it("maps 404 to exit code 7", () => {
    expect(formatError(err(404, { error: "not_found" })).exitCode).toBe(7);
  });

  it("maps unknown status to exit code 1", () => {
    expect(formatError(err(500, { error: "internal" })).exitCode).toBe(1);
  });
});

// Sprint 11 / MKD-131 (SPEC-011 §4 e §9): a API passou a dizer o que fazer.
// O CLI é o canal onde isso mais rende: quem lê o stderr é um agente com
// shell, que pode executar o `next_step` sozinho. Antes a mensagem terminava
// no código do erro ("Authentication failed: unauthorized") e não havia saída.
describe("formatError — hint e next_step na saída (MKD-131)", () => {
  function apiErr(status: number, body: Record<string, unknown>): MarkdownScribeApiError {
    return new MarkdownScribeApiError(status, { error: "test_error", ...body });
  }

  it("401 com next_step imprime o comando que resolve", () => {
    const result = formatError(
      apiErr(401, {
        error: "unauthorized",
        hint: "Send a valid API key in the X-API-Key header.",
        next_step: "mdscribe login",
        docs_url: "https://docs.markdownscribe.com/errors/unauthorized",
      })
    );

    expect(result.exitCode).toBe(2);
    expect(result.message).toContain("Send a valid API key");
    expect(result.message).toContain("mdscribe login");
    expect(result.message).toContain("https://docs.markdownscribe.com/errors/unauthorized");
  });

  it("5xx mostra onde relatar", () => {
    const result = formatError(
      apiErr(503, {
        error: "service_unavailable",
        hint: "Try again shortly.",
        report_url: "https://github.com/markdownscribe/markdownscribe/issues/new?body=req",
      })
    );

    expect(result.exitCode).toBe(6);
    expect(result.message).toContain("issues/new");
  });

  it("erro sem os campos novos continua legível (sem 'undefined' na saída)", () => {
    const result = formatError(apiErr(500, { error: "internal" }));

    expect(result.message).toContain("internal");
    expect(result.message).not.toContain("undefined");
  });

  it("402 mantém o saldo e ainda assim mostra o próximo passo", () => {
    const result = formatError(
      apiErr(402, {
        error: "insufficient_credits",
        balance: 0,
        hint: "Your credit balance is exhausted.",
        pricing_url: "https://markdownscribe.com/pricing",
      })
    );

    expect(result.exitCode).toBe(3);
    expect(result.message).toMatch(/balance: 0/);
    expect(result.message).toContain("exhausted");
  });
});

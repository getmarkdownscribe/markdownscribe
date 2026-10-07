import { describe, expect, it } from "vitest";

import { MarkdownScribeClient } from "../src/index.js";

// Sprint 11 / MKD-132 (SPEC-011 §"headers de crédito"): a API passou a
// devolver X-Credits-Charged e X-Credits-Remaining. Header só serve se
// chegar tipado a quem programa contra o SDK — senão cada integração
// reimplementa a leitura, e metade esquece.
//
// Este teste fala com uma API REAL (Article II), apontada por env:
//
//   MDSCRIBE_TEST_BASE_URL  ex.: http://127.0.0.1:8787
//   MDSCRIBE_TEST_API_KEY   chave com saldo, do banco de teste
//
// Sem as duas, pula. O gate é honesto, mas a lição da MKD-140 é que teste
// que só pula não protege nada — por isso `scripts/sdk-credits-check.mjs`
// sobe a api local, cria a chave e roda este arquivo com as envs prontas,
// para que "rodar de verdade" seja um comando, não um ritual.
const BASE_URL = process.env["MDSCRIBE_TEST_BASE_URL"];
const API_KEY = process.env["MDSCRIBE_TEST_API_KEY"];
const gated = !BASE_URL || !API_KEY;

describe.skipIf(gated)("meta.creditsRemaining — saldo tipado no SDK", () => {
  it("duas chamadas seguidas: o saldo cai pelo custo da primeira", async () => {
    const client = new MarkdownScribeClient({
      apiKey: API_KEY!,
      baseUrl: BASE_URL!,
    });

    const primeira = await client.frontmatter({
      markdown: "---\ntitle: sdk-credits\n---\n\n# Corpo\n",
    });

    expect(primeira.meta.credits).toBe(1);
    expect(typeof primeira.meta.creditsRemaining).toBe("number");

    const segunda = await client.frontmatter({
      markdown: "---\ntitle: sdk-credits-2\n---\n\n# Corpo\n",
    });

    // A asserção que importa: o número CAI, e cai exatamente o que a
    // operação custou. Um `creditsRemaining` que existe mas não se move é
    // pior que ausente — é o agente achando que tem saldo eterno.
    expect(segunda.meta.creditsRemaining).toBe(
      primeira.meta.creditsRemaining! - segunda.meta.credits
    );
  }, 30_000);

  it("operação mais cara desconta mais — lint custa 2", async () => {
    const client = new MarkdownScribeClient({
      apiKey: API_KEY!,
      baseUrl: BASE_URL!,
    });

    const antes = await client.frontmatter({ markdown: "# a\n" });
    const lint = await client.lint({ markdown: "#  titulo\n\n\n\ntexto\n" });

    expect(lint.meta.credits).toBeGreaterThan(1);
    expect(lint.meta.creditsRemaining).toBe(
      antes.meta.creditsRemaining! - lint.meta.credits
    );
  }, 30_000);
});

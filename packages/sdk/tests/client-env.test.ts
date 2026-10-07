import { afterEach, describe, expect, it } from "vitest";

import { detectClientEnv } from "../src/index.js";

// Sprint 11 / MKD-133 (SPEC-011 §"identificação de cliente"): descobrir que
// fração das chamadas nasce de um agente, e de qual. A série chama isso de
// "o primeiro número que eu levantaria".
//
// Aqui é aceitável escrever em process.env no teste: a env var É a entrada
// real desta função — não é mock de API, é o mundo que ela lê.
//
// As variáveis abaixo não foram escolhidas por intuição (ver comentários em
// detect-client-env.ts para as fontes). A que o blueprint supunha,
// CURSOR_TRACE_ID, não existe: a doc da Cursor documenta CURSOR_AGENT.
// Implementar o nome suposto teria produzido uma métrica que nunca dispara —
// e concluiríamos que ninguém usa Cursor.

const CHAVES = [
  "MDSCRIBE_NO_CLIENT_ENV",
  "AGENT",
  "CLAUDECODE",
  "CURSOR_AGENT",
  "CI",
] as const;

const original = new Map<string, string | undefined>();
for (const k of CHAVES) original.set(k, process.env[k]);

function limpar(): void {
  for (const k of CHAVES) delete process.env[k];
}

afterEach(() => {
  limpar();
  for (const [k, v] of original) if (v !== undefined) process.env[k] = v;
});

describe("detectClientEnv — de onde a chamada nasceu", () => {
  it("ambiente sem sinal nenhum → undefined (e não a string 'unknown')", () => {
    limpar();
    // Omitir o header é diferente de mandar "unknown". Um valor que não
    // informa nada ocupa bytes, polui agregação e ainda finge ser dado.
    // Mesma disciplina dos headers de crédito (MKD-132): ausência é
    // informação.
    expect(detectClientEnv()).toBeUndefined();
  });

  it("CLAUDECODE → claude-code", () => {
    limpar();
    process.env["CLAUDECODE"] = "1";
    expect(detectClientEnv()).toBe("claude-code");
  });

  it("CURSOR_AGENT → cursor (nome confirmado na doc oficial, não CURSOR_TRACE_ID)", () => {
    limpar();
    process.env["CURSOR_AGENT"] = "1";
    expect(detectClientEnv()).toBe("cursor");
  });

  it("CI → ci", () => {
    limpar();
    process.env["CI"] = "true";
    expect(detectClientEnv()).toBe("ci");
  });

  it("AGENT=<nome> vence as específicas — é a convenção que cobre agente que ainda não existe", () => {
    limpar();
    process.env["AGENT"] = "goose";
    process.env["CLAUDECODE"] = "1";
    expect(detectClientEnv()).toBe("goose");
  });

  it("AGENT com valor esquisito é sanitizado, não propagado cru", () => {
    limpar();
    // Vai virar header HTTP e depois coluna de banco. Aceitar qualquer coisa
    // daqui seria deixar o ambiente de terceiro escrever no nosso schema.
    process.env["AGENT"] = "  Meu Agente/2.0 (com espaço)  ";
    expect(detectClientEnv()).toBe("meu-agente-2-0-com-espaco");
  });

  it("AGENT vazio ou só lixo não vira valor — cai para o próximo sinal", () => {
    limpar();
    process.env["AGENT"] = "   ";
    process.env["CI"] = "true";
    expect(detectClientEnv()).toBe("ci");
  });

  it("MDSCRIBE_NO_CLIENT_ENV=1 desliga tudo, mesmo com sinal presente", () => {
    limpar();
    process.env["CLAUDECODE"] = "1";
    process.env["AGENT"] = "goose";
    process.env["MDSCRIBE_NO_CLIENT_ENV"] = "1";
    // Quem não quiser contar a origem não conta. Privacidade não pode
    // depender de a pessoa descobrir um jeito torto de burlar a deteccao.
    expect(detectClientEnv()).toBeUndefined();
  });

  it("precedência entre específicas: agente nomeado antes de CI", () => {
    limpar();
    // Um agente rodando DENTRO de um CI é as duas coisas. O que interessa
    // para a taxa de adoção é o agente — CI é o fallback mais genérico.
    process.env["CLAUDECODE"] = "1";
    process.env["CI"] = "true";
    expect(detectClientEnv()).toBe("claude-code");
  });
});

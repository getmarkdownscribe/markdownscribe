import { existsSync } from "node:fs";
import { join } from "node:path";
import AjvModule from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";
import { describe, expect, it } from "vitest";

import { API_BASE, EXAMPLES_DIR, loadExample, loadOpenApi, operationsFromOpenApi } from "../scripts/operation-blocks.mjs";

// O exemplo que a página mostra é o arquivo que este teste executa contra a
// API de produção, com a chave de CI das docs. Confere status, créditos
// cobrados, trechos do corpo e o corpo inteiro contra o schema publicado no
// openapi.json: a página não pode mostrar uma resposta que o contrato não descreve.
//
// Sem chave, pula com aviso; com MDSCRIBE_REQUIRE_LIVE=1 (CI do próprio
// repositório) a falta da chave falha, como em packages/sdk e packages/cli.
const KEY = process.env["MDSCRIBE_DOCS_API_KEY"];
if (!KEY && process.env["MDSCRIBE_REQUIRE_LIVE"] === "1") {
  throw new Error("MDSCRIBE_REQUIRE_LIVE=1 but MDSCRIBE_DOCS_API_KEY is not set: live examples cannot run.");
}

interface Example {
  request: { method: string; path: string; body: unknown };
  expect: { status: number; creditsCharged: number; bodyContains: string[] };
}

// ajv e ajv-formats são CommonJS; tipagem mínima do que o teste usa.
interface Validator {
  (data: unknown): boolean;
  errors?: { instancePath: string; message?: string }[] | null;
}
const Ajv2020 = AjvModule as unknown as new (opts: { strict: boolean; allErrors: boolean }) => {
  addSchema(schema: object, key: string): unknown;
  compile(schema: object): Validator;
};
const addFormats = addFormatsModule as unknown as (ajv: object) => void;

// O documento inteiro registrado deixa o ajv resolver os `$ref` internos;
// `strict: false` porque ele carrega palavras-chave de OpenAPI.
const doc = loadOpenApi();
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema(doc, "openapi.json");

const pointer = (s: string) => s.replace(/~/g, "~0").replace(/\//g, "~1");
const ops = (operationsFromOpenApi(doc) as { operationId: string; method: string; path: string }[]).filter((o) =>
  existsSync(join(EXAMPLES_DIR, `${o.operationId}.json`))
);

describe.skipIf(!KEY)("exemplos das páginas de operação, executados contra a API", () => {
  it("existe ao menos um exemplo", () => {
    expect(ops.length).toBeGreaterThan(0);
  });

  it.each(ops.map((o) => [o.operationId, o]))(
    "%s",
    async (_id, op) => {
      const ex = loadExample(op.operationId) as Example;
      expect(ex.request.path).toBe(op.path);
      const res = await fetch(`${API_BASE}${ex.request.path}`, {
        method: ex.request.method,
        headers: { "Content-Type": "application/json", "X-API-Key": KEY as string, "X-Client-Env": "ci" },
        body: JSON.stringify(ex.request.body),
      });
      const text = await res.text();
      expect(res.status, text.slice(0, 300)).toBe(ex.expect.status);
      expect(Number(res.headers.get("x-credits-charged"))).toBe(ex.expect.creditsCharged);
      for (const piece of ex.expect.bodyContains) expect(text).toContain(piece);

      const validate = ajv.compile({
        $ref: `openapi.json#/paths/${pointer(op.path)}/${op.method}/responses/${ex.expect.status}/content/application~1json/schema`,
      });
      const ok = validate(JSON.parse(text));
      expect(ok, JSON.stringify(validate.errors)).toBe(true);
    },
    60_000
  );
});

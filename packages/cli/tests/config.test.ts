import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resolveConfig, ConfigError } from "../src/config.js";

// SPEC-010 §CLI: resolução de chave (MDSCRIBE_API_KEY -> .env no cwd,
// nessa ordem) e de URL (MDSCRIBE_URL -> --base-url -> default
// de produção). Sem chave resolvida, erro claro ANTES de qualquer chamada
// de rede (exit code 1 tratado em output.ts).
describe("resolveConfig", () => {
  const ORIGINAL_ENV = { ...process.env };
  let cwd: string;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), "mdscribe-cli-config-"));
    delete process.env["MDSCRIBE_API_KEY"];
    delete process.env["API_KEY_MAT"];
    delete process.env["MDSCRIBE_URL"];
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
    process.env = { ...ORIGINAL_ENV };
  });

  it("resolves apiKey from MDSCRIBE_API_KEY when set", () => {
    process.env["MDSCRIBE_API_KEY"] = "from-mdscribe-env";

    const config = resolveConfig({ cwd });

    expect(config.apiKey).toBe("from-mdscribe-env");
  });

  // 0.2.0: o fallback API_KEY_MAT era nome interno da época de usuário
  // único. Não pode virar contrato público de um pacote MIT.
  it("ignores the legacy API_KEY_MAT variable", () => {
    process.env["API_KEY_MAT"] = "from-api-key-mat";

    expect(() => resolveConfig({ cwd })).toThrow(ConfigError);
  });

  it("falls back to .env in cwd when no env var is set", () => {
    writeFileSync(join(cwd, ".env"), "MDSCRIBE_API_KEY=from-dotenv-file\n");

    const config = resolveConfig({ cwd });

    expect(config.apiKey).toBe("from-dotenv-file");
  });

  it("throws ConfigError with a clear message when no key can be resolved anywhere", () => {
    expect(() => resolveConfig({ cwd })).toThrow(ConfigError);
    expect(() => resolveConfig({ cwd })).toThrow(/MDSCRIBE_API_KEY/);
  });

  it("resolves baseUrl from MDSCRIBE_URL when set", () => {
    process.env["MDSCRIBE_API_KEY"] = "key";
    process.env["MDSCRIBE_URL"] = "https://from-env.example";

    const config = resolveConfig({ cwd });

    expect(config.baseUrl).toBe("https://from-env.example");
  });

  it("prefers --base-url over MDSCRIBE_URL", () => {
    process.env["MDSCRIBE_API_KEY"] = "key";
    process.env["MDSCRIBE_URL"] = "https://from-env.example";

    const config = resolveConfig({ cwd, baseUrlFlag: "https://from-flag.example" });

    expect(config.baseUrl).toBe("https://from-flag.example");
  });

  // Sprint 11 / MKD-130 (SPEC-013 §10): o host padrão passa a ser o domínio
  // próprio: um agente que lê o pacote precisa conseguir associar a URL ao
  // produto.
  it("defaults baseUrl to api.markdownscribe.com when nothing is set", () => {
    process.env["MDSCRIBE_API_KEY"] = "key";

    const config = resolveConfig({ cwd });

    expect(config.baseUrl).toBe("https://api.markdownscribe.com");
  });
});

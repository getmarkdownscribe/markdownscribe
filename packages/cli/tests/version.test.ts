import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { CLI_VERSION } from "../src/version.js";
import { runCli } from "./support/run-cli.js";

// Sprint 11 / MKD-133: guarda contra a constante apodrecer. Ver o comentario
// em src/version.ts — uma versao desatualizada no User-Agent nao quebra nada
// visivelmente, so faz a metrica de adocao mentir sem sintoma.
describe("CLI_VERSION", () => {
  it("e exatamente a versao publicada no package.json", () => {
    const aqui = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(
      readFileSync(resolve(aqui, "..", "package.json"), "utf8")
    ) as { version: string };

    expect(CLI_VERSION).toBe(pkg.version);
  });

  // 0.2.0: o bin.ts tinha .version("0.1.0") escrito a mao, separado da
  // constante. O --version mentiria para sempre sem que nada falhasse.
  it("o binario compilado responde --version com a mesma versao", () => {
    const result = runCli(["--version"], {});
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(CLI_VERSION);
  });
});

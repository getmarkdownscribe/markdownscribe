import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { CLI_VERSION } from "../src/version.js";

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
});

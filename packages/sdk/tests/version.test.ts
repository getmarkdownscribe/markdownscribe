import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { SDK_VERSION } from "../src/version.js";

// Sprint 11 / MKD-133: a guarda que impede a constante de apodrecer.
//
// O User-Agent carrega a versão do SDK, e é por ela que vamos saber quem já
// migrou quando publicarmos a 0.2.0. Uma constante escrita à mão que não
// acompanha o package.json não quebra nada visivelmente — só faz o número da
// adoção mentir, indefinidamente e sem sintoma. Esta é a única linha de
// defesa contra isso, e ela precisa existir ANTES de a divergência acontecer.
describe("SDK_VERSION", () => {
  it("é exatamente a versão publicada no package.json", () => {
    const aqui = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(
      readFileSync(resolve(aqui, "..", "package.json"), "utf8")
    ) as { version: string };

    expect(SDK_VERSION).toBe(pkg.version);
  });
});

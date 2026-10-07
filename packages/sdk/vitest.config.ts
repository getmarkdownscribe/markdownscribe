import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// MKD-154: o mesmo carregamento de ambiente do packages/api (MKD-140/157).
// Sem ele, o `pnpm test` da raiz rodava este pacote sem TEST_DATABASE_URL e
// todo teste contra Postgres real se auto-pulava em silêncio — 16 dos 33 testes —,
// inclusive um que estava quebrado desde a MKD-148.
//
// O import é do packages/api de propósito: estes testes já sobem a api de
// verdade (tests/support/spawn-api.ts) e só existem dentro do monorepo.
// Quando este pacote for para o repositório público (MKD-136), a mesma
// história decide como esses testes rodam lá.
import { loadRootEnv } from "../api/src/test-support/root-env.js";

const RAIZ_DO_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export default defineConfig({
  test: {
    exclude: ["dist/**", "node_modules/**"],
    env: loadRootEnv(RAIZ_DO_REPO),
  },
});

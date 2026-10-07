import { existsSync } from "node:fs";
import { join } from "node:path";
import { config as loadDotenv } from "dotenv";
import { DEFAULT_BASE_URL } from "@markdownscribe/sdk";

export class ConfigError extends Error {}

export interface ResolveConfigOptions {
  cwd: string;
  baseUrlFlag?: string;
}

export interface CliConfig {
  apiKey: string;
  baseUrl: string;
}

// Resolução de chave: MDSCRIBE_API_KEY -> API_KEY_MAT (compat `railway run`)
// -> .env no cwd, nessa ordem (SPEC-010 §CLI). Resolução de URL: --base-url
// -> MDSCRIBE_URL -> DEFAULT_BASE_URL do SDK (api.markdownscribe.com desde a
// Sprint 11 / MKD-130; fonte única, não duplicar aqui).
export function resolveConfig(options: ResolveConfigOptions): CliConfig {
  const dotenvPath = join(options.cwd, ".env");
  const dotenvResult = existsSync(dotenvPath) ? loadDotenv({ path: dotenvPath }).parsed : undefined;

  const apiKey =
    process.env["MDSCRIBE_API_KEY"] ?? process.env["API_KEY_MAT"] ?? dotenvResult?.["MDSCRIBE_API_KEY"];

  if (!apiKey) {
    throw new ConfigError(
      "No API key found. Set MDSCRIBE_API_KEY (or API_KEY_MAT), or add MDSCRIBE_API_KEY to a .env file in the current directory."
    );
  }

  const baseUrl = options.baseUrlFlag ?? process.env["MDSCRIBE_URL"] ?? DEFAULT_BASE_URL;

  return { apiKey, baseUrl };
}

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

// Resolução de chave: MDSCRIBE_API_KEY -> .env no cwd, nessa ordem. Resolução de URL: --base-url
// -> MDSCRIBE_URL -> DEFAULT_BASE_URL do SDK (api.markdownscribe.com desde a
// Sprint 11 / MKD-130; fonte única, não duplicar aqui).
export function resolveConfig(options: ResolveConfigOptions): CliConfig {
  const dotenvPath = join(options.cwd, ".env");
  const dotenvResult = existsSync(dotenvPath) ? loadDotenv({ path: dotenvPath }).parsed : undefined;

  const apiKey =
    process.env["MDSCRIBE_API_KEY"] ?? dotenvResult?.["MDSCRIBE_API_KEY"];

  if (!apiKey) {
    throw new ConfigError(
      "No API key found. Set MDSCRIBE_API_KEY, or add MDSCRIBE_API_KEY to a .env file in the current directory."
    );
  }

  const baseUrl = options.baseUrlFlag ?? process.env["MDSCRIBE_URL"] ?? DEFAULT_BASE_URL;

  return { apiKey, baseUrl };
}

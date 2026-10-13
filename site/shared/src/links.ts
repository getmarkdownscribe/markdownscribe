// Os hosts públicos. Os três primeiros são os que o `GET /` da API promete
// (`docs`, `llms_txt`, `pricing`, `openapi`); o verificador de URLs da
// história I confere que cada um entrega o conteúdo esperado.
export const HOSTS = {
  site: "https://markdownscribe.com",
  docs: "https://docs.markdownscribe.com",
  api: "https://api.markdownscribe.com",
  dashboard: "https://dashboard.markdownscribe.com",
} as const;

export const CONTACT = {
  support: "support@markdownscribe.com",
  security: "security@markdownscribe.com",
} as const;

export const REPO_URL = "https://github.com/getmarkdownscribe/markdownscribe";

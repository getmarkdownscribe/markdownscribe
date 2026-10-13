// @ts-check
import { defineConfig } from "astro/config";

// markdownscribe.com: site estático servido por um Worker com static assets
// (D-047 §1). Sem adapter: tudo é pré-renderizado no build.
export default defineConfig({
  site: "https://markdownscribe.com",
  trailingSlash: "ignore",
});

// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { brandHeadTags } from "@markdownscribe/site-shared/head-tags";

const PRODUCT_DESCRIPTION =
  "MarkdownScribe does the Markdown work in one API call: parse frontmatter, build a TOC, lint, format, render Mermaid to SVG, convert any URL to Markdown. Pay per credit.";

// O Starlight já emite o <link rel="icon"> do `favicon`; o resto das tags da
// marca (ico, apple-touch-icon, manifesto, theme-color) vem de head.html.
const headTags = brandHeadTags().filter(
  (t) => !(t.tag === "link" && t.attrs["href"] === "/favicon.svg")
);

// docs.markdownscribe.com: Starlight estático num Worker (D-047 §1-§2).
export default defineConfig({
  site: "https://docs.markdownscribe.com",
  integrations: [
    starlight({
      title: "MarkdownScribe",
      description: PRODUCT_DESCRIPTION,
      logo: {
        light: "../shared/brand/logo/lockup-light.svg",
        dark: "../shared/brand/logo/lockup-dark.svg",
        replacesTitle: true,
      },
      favicon: "/favicon.svg",
      head: headTags,
      customCss: ["@markdownscribe/site-shared/starlight.css"],
      // Rótulos em sentence case (SPEC-015). Cada grupo novo entra aqui na
      // história que cria as páginas dele.
      sidebar: [
        { label: "Overview", link: "/" },
        { label: "Errors", items: [{ autogenerate: { directory: "errors" } }] },
      ],
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/getmarkdownscribe/markdownscribe" },
      ],
    }),
  ],
});

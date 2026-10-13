import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Nenhuma página do site ou das docs usa termo de autoridade: comparações são
// condicionais e verificáveis. Lido do build, em toda página.
const TERMS = [
  /\bbest\b/i,
  /#1\b/,
  /\bnumber one\b/i,
  /\bleading\b/i,
  /\bthousands of\b/i,
  /\btrusted by\b/i,
  /\bthe only\b/i,
  /\bworld-class\b/i,
];

const SITE = join(__dirname, "..", "..");
const DISTS = [join(SITE, "www", "dist"), join(SITE, "docs", "dist")];

function htmlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return htmlFiles(p);
    return d.name.endsWith(".html") ? [p] : [];
  });
}

// Só o texto que um leitor vê: sem script, style e atributos.
function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"');
}

describe("nenhuma página usa termo de autoridade", () => {
  it("os dois builds existem", () => {
    for (const d of DISTS) expect(existsSync(d), `${d}: rode o build antes`).toBe(true);
  });

  const files = DISTS.flatMap(htmlFiles);
  it.each(files.map((f) => [relative(SITE, f), f]))("%s", (_name, file) => {
    const text = visibleText(readFileSync(file, "utf8"));
    for (const term of TERMS) {
      const hit = text.match(term);
      expect(hit, hit ? `"${text.slice(Math.max(0, (hit.index ?? 0) - 60), (hit.index ?? 0) + 60)}"` : "").toBeNull();
    }
  });
});

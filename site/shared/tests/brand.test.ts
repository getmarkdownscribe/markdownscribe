import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// SPEC-015 §11 (repositório privado): site/shared/brand/ é uma cópia gerada por
// `pnpm brand:sync`. Este teste é a guarda que vale aqui, porque o CI deste
// repositório não vê o privado: os arquivos que o site consome existem, e os
// pares texto/fundo passam em AA nos dois modos. A fórmula de contraste é a da
// WCAG 2.x, escrita de novo de propósito (não importada da cópia) para que um
// defeito na cópia não se esconda atrás de si mesmo.

const brandDir = join(__dirname, "..", "brand");

function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const channel = (i: number) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

type Tokens = {
  color: { light: Record<string, string>; dark: Record<string, string> };
  pairs: Array<{ fg: string; bg: string; min: number }>;
};

describe("brand assets synced from the private repository", () => {
  const required = [
    "README.md",
    "tokens.json",
    "tokens.css",
    "logo/symbol-light.svg",
    "logo/symbol-dark.svg",
    "logo/symbol-mono.svg",
    "logo/symbol-mono-inverse.svg",
    "logo/lockup-light.svg",
    "logo/lockup-dark.svg",
    "logo/lockup-mono.svg",
    "logo/lockup-mono-inverse.svg",
    "logo/tile.svg",
    "favicon/favicon.svg",
    "favicon/favicon.ico",
    "favicon/apple-touch-icon.png",
    "favicon/icon-192.png",
    "favicon/icon-512.png",
    "favicon/site.webmanifest",
    "favicon/head.html",
    "og/og-default.png",
    "fonts/AtkinsonHyperlegibleNext-Regular.woff2",
    "fonts/AtkinsonHyperlegibleNext-Medium.woff2",
    "fonts/JetBrainsMono-Regular.woff2",
  ];

  it.each(required)("%s exists", (file) => {
    expect(existsSync(join(brandDir, file))).toBe(true);
  });

  it("tokens.css is generated from tokens.json and carries both modes", () => {
    const css = readFileSync(join(brandDir, "tokens.css"), "utf8");
    const tokens = JSON.parse(readFileSync(join(brandDir, "tokens.json"), "utf8")) as Tokens;
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain("prefers-color-scheme: dark");
    for (const [name, value] of Object.entries(tokens.color.light)) {
      expect(css).toContain(`--ms-${name}: ${value};`);
    }
  });

  it("every declared text/background pair meets its minimum in both modes", () => {
    const tokens = JSON.parse(readFileSync(join(brandDir, "tokens.json"), "utf8")) as Tokens;
    expect(tokens.pairs.length).toBeGreaterThan(10);
    const failures: string[] = [];
    for (const mode of ["light", "dark"] as const) {
      for (const pair of tokens.pairs) {
        const ratio = contrast(tokens.color[mode][pair.fg], tokens.color[mode][pair.bg]);
        if (ratio < pair.min) failures.push(`${mode}: ${pair.fg} on ${pair.bg} = ${ratio.toFixed(2)} < ${pair.min}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("the manifest names the product and points at the icons it ships", () => {
    const manifest = JSON.parse(readFileSync(join(brandDir, "favicon/site.webmanifest"), "utf8"));
    expect(manifest.name).toBe("MarkdownScribe");
    for (const icon of manifest.icons as Array<{ src: string }>) {
      expect(existsSync(join(brandDir, "favicon", icon.src.replace(/^\//, "")))).toBe(true);
    }
  });
});

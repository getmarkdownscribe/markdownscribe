// Confere o que o registro do npm diz sobre uma versao publicada:
//
//   node scripts/check-npm-published.mjs <pacote> <versao>
//
// Exige repository.url, homepage, license e attestations (provenance). E o
// criterio de aceite da publicacao lido de fora, do jeito que quem avalia a
// dependencia vai ler. Tenta por ate ~1 min: o registro demora a refletir.

const [name, version] = process.argv.slice(2);
if (!name || !version) {
  console.error("usage: node scripts/check-npm-published.mjs <package> <version>");
  process.exitCode = 2;
} else {
  const url = `https://registry.npmjs.org/${name.replace("/", "%2F")}/${version}`;
  let doc;
  for (let attempt = 1; attempt <= 6 && !doc; attempt++) {
    const res = await fetch(url);
    if (res.ok) doc = await res.json();
    else if (attempt < 6) await new Promise((r) => setTimeout(r, 10_000));
  }

  if (!doc) {
    console.error(`${name}@${version}: not found in the registry`);
    process.exitCode = 1;
  } else {
    const checks = {
      "repository.url": doc.repository?.url,
      homepage: doc.homepage,
      license: doc.license,
      "dist.attestations": doc.dist?.attestations?.url,
    };
    const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    for (const [k, v] of Object.entries(checks)) console.log(`${k}: ${v ?? "MISSING"}`);
    if (missing.length > 0) {
      console.error(`${name}@${version}: missing ${missing.join(", ")}`);
      process.exitCode = 1;
    } else {
      console.log(`${name}@${version}: ok`);
    }
  }
}

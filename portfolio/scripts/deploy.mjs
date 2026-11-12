#!/usr/bin/env node
/*
 * Publica la web en Vercel con los archivos de código versionados (?v=<hash>), para que todos los
 * navegadores bajen la versión nueva apenas vuelven a entrar, incluso los de WhatsApp e Instagram,
 * que guardan las páginas más tiempo.
 *
 *   node scripts/deploy.mjs           publica en producción
 *   node scripts/deploy.mjs --dry     solo muestra la versión y qué archivos cambiaría
 *
 * Primero corre scripts/prerender.mjs, que genera la página de cada ruta y el sitemap a partir de site.js.
 * Después calcula un hash con el contenido de scripts/ y styles/, lo agrega a los <script> y al CSS de
 * index.html y de cada página generada, y a los @import de styles/main.css, publica, y deja los archivos
 * como estaban: el repositorio no guarda los ?v=. Las fotos y videos no lo necesitan: cambian de nombre
 * cuando cambian.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry");

function filesIn(dir, ext) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return filesIn(p, ext);
    return ext.includes(path.extname(e.name)) ? [p] : [];
  });
}

// Páginas generadas, sin versión todavía (se reescriben antes de calcular el hash).
execFileSync("node", [path.join(ROOT, "scripts/prerender.mjs")], { cwd: ROOT, stdio: "inherit" });

const sources = [...filesIn(path.join(ROOT, "scripts"), [".js"]), ...filesIn(path.join(ROOT, "styles"), [".css"])].sort();
const hash = crypto.createHash("sha1");
for (const f of sources) hash.update(path.relative(ROOT, f)).update(fs.readFileSync(f));
const version = hash.digest("hex").slice(0, 10);

const withVersion = (s) =>
  s
    .replace(/(<script src="\/?scripts\/[^"?]+\.js)(\?v=[^"]*)?"/g, `$1?v=${version}"`)
    .replace(/(<link rel="stylesheet" href="\/?styles\/[^"?]+\.css)(\?v=[^"]*)?"/g, `$1?v=${version}"`);

const htmlPages = [
  path.join(ROOT, "index.html"),
  ...["work", "estudio", "contacto"].flatMap((d) => (fs.existsSync(path.join(ROOT, d)) ? filesIn(path.join(ROOT, d), [".html"]) : []))
];
const targets = new Map(htmlPages.map((file) => [file, withVersion]));
targets.set(path.join(ROOT, "styles/main.css"), (s) => s.replace(/@import url\("([^"?]+\.css)(\?v=[^"]*)?"\)/g, `@import url("$1?v=${version}")`));

const originals = {};
let refs = 0;
for (const [file, transform] of targets) {
  originals[file] = fs.readFileSync(file, "utf8");
  const next = transform(originals[file]);
  refs += (next.match(new RegExp(`\\?v=${version}`, "g")) || []).length;
  if (!dry) fs.writeFileSync(file, next);
}
console.log(`${targets.size} archivos, ${refs} referencias con ?v=${version}`);

if (dry) process.exit(0);
try {
  execFileSync("vercel", ["deploy", "--prod", "--yes"], { cwd: ROOT, stdio: "inherit" });
} finally {
  for (const [file, text] of Object.entries(originals)) fs.writeFileSync(file, text);
}
console.log(`Publicado con la versión ${version}. Los archivos locales quedaron sin ?v=.`);

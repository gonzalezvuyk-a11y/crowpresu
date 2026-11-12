#!/usr/bin/env node
/*
 * Genera una página estática por ruta para que Google y las redes puedan leer cada una por separado:
 *   work/<slug>/index.html   una por proyecto
 *   estudio/index.html       contacto/index.html
 *   sitemap.xml              con todas las direcciones
 * y actualiza el bloque de la portada dentro de index.html (entre <!-- prerender:start --> y <!-- prerender:end -->).
 *
 * Cada página es index.html con su <title>, descripción, canónico y etiquetas para compartir propios, un
 * título y un resumen escritos en el HTML (ocultos a la vista: el sitio los reemplaza al cargar) y los datos
 * estructurados de migas de pan. Todo sale de scripts/data/site.js: no se edita a mano.
 *
 *   node scripts/prerender.mjs
 *
 * scripts/deploy.mjs lo corre solo antes de publicar. Los archivos generados se guardan en el repositorio.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://thecrowfilm.com";
const require = createRequire(import.meta.url);

globalThis.window = {};
require(path.join(ROOT, "scripts/data/photos.js"));
require(path.join(ROOT, "scripts/data/site.js"));
const { site, projects, services } = globalThis.window.CROW;

const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const label = (p) => (p.detail ? `${p.title}, ${p.detail}` : p.title);
const fullTitle = (t) => (t.startsWith(site.name) ? t : `${t} — ${site.name}`);

const DESCRIPTION_HOME = "theCrow. es un estudio de contenido visual: fotografía, video, edición y producción para marcas, eventos y experiencias. Always present.";

const pages = [
  {
    path: "/",
    file: "index.html",
    title: `${site.name} ${site.descriptor}`,
    description: DESCRIPTION_HOME,
    body: `<h1>${esc(site.name)} ${esc(site.descriptor)}</h1>
      <p>${esc(site.intro)}</p>
      <nav aria-label="Proyectos"><ul>${projects
        .map((p) => `<li><a href="/work/${encodeURIComponent(p.slug)}">${esc(label(p))}</a>, ${esc(p.category)}, ${p.year}</li>`)
        .join("")}</ul></nav>
      <p><a href="/estudio">Estudio</a> · <a href="/contacto">Contacto</a></p>`
  },
  ...projects.map((p) => ({
    path: `/work/${encodeURIComponent(p.slug)}`,
    file: `work/${p.slug}/index.html`,
    title: label(p),
    description: `${label(p)}: ${p.category.toLowerCase()} de ${site.name} (${p.year}). ${site.descriptor} en Asunción, Paraguay.`,
    crumb: label(p),
    body: `<h1>${esc(p.title)}${p.detail ? `, ${esc(p.detail)}` : ""}</h1>
      <p>${esc(p.category)}, ${p.year}. ${esc(site.name)}, ${esc(site.descriptor.toLowerCase())} en Asunción, Paraguay.${p.media.length ? ` ${p.media.length} piezas entre fotos y videos.` : ""}</p>
      <p><a href="/">Ver todos los proyectos</a></p>`
  })),
  {
    path: "/estudio",
    file: "estudio/index.html",
    title: "Estudio",
    description: "theCrow. nace como evolución del trabajo de Roxanna Ramírez: fotógrafa, videógrafa y editora. Cobertura realtime, contenido para marcas y spots y campañas en Asunción, Paraguay.",
    crumb: "Estudio",
    body: `<h1>Estudio de contenido visual.</h1>
      <p>theCrow. nace como evolución del trabajo de Roxanna Ramírez: fotógrafa, videógrafa y editora.</p>
      <ul>${services.map((s) => `<li><strong>${esc(s.name)}</strong>: ${esc(s.text)}</li>`).join("")}</ul>`
  },
  {
    path: "/contacto",
    file: "contacto/index.html",
    title: "Contacto",
    description: "Escribinos por WhatsApp, mail o el formulario: eventos, marcas, campañas o contenido recurrente en Asunción, Paraguay.",
    crumb: "Contacto",
    body: `<h1>Contemos lo que está pasando.</h1>
      <p>Eventos, marcas, campañas o contenido recurrente. ${esc(site.location)}.</p>
      <ul>${site.email ? `<li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>` : ""}${site.whatsapp ? `<li>WhatsApp ${esc(site.whatsapp)}</li>` : ""}<li>Instagram @${esc(site.instagram.handle)}</li></ul>`
  }
];

const template = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const START = "<!-- prerender:start -->";
const END = "<!-- prerender:end -->";
if (!template.includes(START) || !template.includes(END)) throw new Error("Faltan las marcas prerender en index.html");

function build(page) {
  const title = fullTitle(page.title);
  const url = SITE_URL + page.path;
  let html = template;
  const swap = (pattern, replacement) => {
    if (!pattern.test(html)) throw new Error(`No se encontró ${pattern} en index.html`);
    html = html.replace(pattern, () => replacement);
  };
  // En la portada se conserva el título largo de index.html.
  if (page.path !== "/") swap(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  swap(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(page.description)}">`);
  swap(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  if (page.path !== "/") {
    swap(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
    swap(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
    swap(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(page.description)}">`);
    swap(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`);
    swap(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(page.description)}">`);
  }
  if (page.crumb) {
    const crumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Work", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: page.crumb, item: url }
      ]
    };
    html = html.replace("</head>", () => `  <script type="application/ld+json">${JSON.stringify(crumbs)}</script>\n</head>`);
  }
  const block = `${START}\n    <div class="visually-hidden" data-prerender>\n      ${page.body}\n    </div>\n    ${END}`;
  return html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), () => block);
}

// Los archivos de work/ son siempre generados: se borran para no dejar proyectos que ya no existen.
const workDir = path.join(ROOT, "work");
if (fs.existsSync(workDir)) fs.rmSync(workDir, { recursive: true });

for (const page of pages) {
  const out = path.join(ROOT, page.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const html = build(page);
  // index.html es la plantilla y a la vez la portada: solo cambia el bloque entre las marcas.
  fs.writeFileSync(out, html);
}

const today = new Date().toISOString().slice(0, 10);
const urls = pages.map((p) => `  <url>\n    <loc>${SITE_URL}${p.path === "/" ? "/" : p.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`);
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);

console.log(`Prerender: ${pages.length} páginas y sitemap con ${urls.length} direcciones.`);

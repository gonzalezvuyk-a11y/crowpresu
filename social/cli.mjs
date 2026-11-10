#!/usr/bin/env node
/*
 * Publica proyectos del portfolio en Instagram y Facebook con la Graph API de Meta.
 * Sin dependencias: Node 18+ y ffmpeg. Lee el contenido de portfolio/scripts/data (site.js y photos.js).
 *
 *   node social/cli.mjs setup                       genera los tokens a partir de .env (una sola vez)
 *   node social/cli.mjs check                       verifica que las cuentas respondan
 *   node social/cli.mjs list                        proyectos que se pueden publicar
 *   node social/cli.mjs prepare <slug> [--pick 1-4] convierte las fotos a JPG para Instagram
 *   node social/cli.mjs post <slug> [opciones]      simula la publicación (agregar --publish para publicar)
 *   node social/cli.mjs post-files <carpeta> --caption "..."   publica JPG propios (ej. carrusel de Figma)
 *
 * Opciones de post: --pick 1,3,5-8  --to ig,fb  --caption "texto" | --caption-file ruta  --ratio 4:5|1:1  --publish
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORTFOLIO = path.join(ROOT, "portfolio");
const ENV_FILE = path.join(ROOT, "social", ".env");
const MAX_ITEMS = 10; // límite de un carrusel de Instagram
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- configuración ----------
function loadEnv() {
  const env = { ...process.env };
  if (fs.existsSync(ENV_FILE)) {
    for (const line of fs.readFileSync(ENV_FILE, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !line.trim().startsWith("#") && m[2]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  env.SITE_URL = (env.SITE_URL || "https://thecrowfilm.com").replace(/\/$/, "");
  env.GRAPH_VERSION = env.GRAPH_VERSION || "v23.0";
  return env;
}

// Escribe claves en .env sin tocar el resto (los tokens nunca se imprimen).
function saveEnv(updates) {
  let text = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    const re = new RegExp(`^${key}=.*$`, "m");
    text = re.test(text) ? text.replace(re, () => `${key}=${value}`) : `${text.replace(/\n?$/, "\n")}${key}=${value}\n`;
  }
  fs.writeFileSync(ENV_FILE, text, { mode: 0o600 });
}

function need(env, keys) {
  const missing = keys.filter((k) => !env[k]);
  if (missing.length) fail(`Faltan en social/.env: ${missing.join(", ")}. Ver social/README.md.`);
}

function fail(message) {
  console.error(`\nError: ${message}`);
  process.exit(1);
}

// ---------- contenido del sitio ----------
function loadSite() {
  const ctx = vm.createContext({ window: {} });
  for (const file of ["photos.js", "site.js"]) {
    vm.runInContext(fs.readFileSync(path.join(PORTFOLIO, "scripts", "data", file), "utf8"), ctx, { filename: file });
  }
  return ctx.window.CROW;
}

// Piezas con archivo propio (los reproductores de Adobe no tienen archivo y no se pueden publicar).
function postablePieces(project) {
  return project.media
    .filter((m) => m.type === "image" || m.type === "video")
    .map((m, i) => ({ n: i + 1, ...m }));
}

function findProject(site, slug) {
  const project = site.projects.find((p) => p.slug === slug);
  if (!project) fail(`No existe el proyecto "${slug}". Corré "list" para ver los disponibles.`);
  return project;
}

function parsePick(spec, total) {
  if (!spec) return Array.from({ length: Math.min(total, MAX_ITEMS) }, (_, i) => i + 1);
  const out = [];
  for (const part of String(spec).split(",")) {
    const [a, b] = part.split("-").map(Number);
    for (let n = a; n <= (b || a); n++) if (n >= 1 && n <= total && !out.includes(n)) out.push(n);
  }
  return out;
}

// ---------- archivos para Instagram ----------
// Instagram solo acepta JPG en fotos y la proporción tiene que estar entre 4:5 y 1,91:1.
function cropFor(w, h, forced) {
  const r = w / h;
  let target = forced;
  if (!target) {
    if (r < 0.8) target = 0.8;
    else if (r > 1.91) target = 1.91;
    else return null;
  }
  if (r > target) {
    const cw = Math.round(h * target);
    return { w: cw, h, x: Math.round((w - cw) / 2), y: 0 };
  }
  const ch = Math.round(w / target);
  return { w, h: ch, x: 0, y: Math.round((h - ch) * 0.25) }; // el recorte favorece la parte de arriba (caras)
}

const socialJpg = (slug, src) => `media/_social/${slug}/${path.basename(src).replace(/\.\w+$/, ".jpg")}`;

function prepareImage(slug, piece, ratio) {
  const input = path.join(PORTFOLIO, piece.src);
  const output = path.join(PORTFOLIO, socialJpg(slug, piece.src));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const crop = cropFor(piece.width, piece.height, ratio);
  const filters = [crop && `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y}`, "scale=w='min(1440,iw)':h=-2"].filter(Boolean).join(",");
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", input, "-vf", filters, "-q:v", "2", output]);
  return output;
}

function publicUrl(env, slug, piece) {
  return `${env.SITE_URL}/${piece.type === "image" ? socialJpg(slug, piece.src) : piece.src}`;
}

async function assertPublished(items) {
  const missing = [];
  for (const item of items) {
    const res = await fetch(item.url, { method: "HEAD" }).catch(() => null);
    if (!res || !res.ok) missing.push(item.url);
  }
  if (missing.length) {
    fail(`Meta necesita URLs públicas y estos archivos todavía no están en el sitio:\n  ${missing.join("\n  ")}\nCorré "prepare" y publicá la web (cd portfolio && vercel deploy --prod --yes).`);
  }
}

// ---------- Graph API ----------
async function graph(env, method, endpoint, params = {}, token = env.META_PAGE_TOKEN) {
  const url = new URL(`https://graph.facebook.com/${env.GRAPH_VERSION}/${endpoint}`);
  const body = new URLSearchParams({ ...params, access_token: token });
  const res = method === "GET" ? await fetch(`${url}?${body}`) : await fetch(url, { method, body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(`Meta API (${endpoint}): ${json.error?.message || res.status}${json.error?.code ? ` [código ${json.error.code}]` : ""}`);
  }
  return json;
}

async function waitReady(env, containerId) {
  for (let i = 0; i < 60; i++) {
    const r = await graph(env, "GET", containerId, { fields: "status_code,status" });
    if (r.status_code === "FINISHED") return;
    if (r.status_code === "ERROR" || r.status_code === "EXPIRED") throw new Error(`Instagram no pudo procesar el archivo: ${r.status || r.status_code}`);
    await sleep(5000);
  }
  throw new Error("Instagram tardó demasiado en procesar el video.");
}

async function postInstagram(env, items, caption) {
  const ig = env.IG_USER_ID;
  let container;
  if (items.length === 1 && items[0].video) {
    container = await graph(env, "POST", `${ig}/media`, { media_type: "REELS", video_url: items[0].url, caption, share_to_feed: "true" });
  } else if (items.length === 1) {
    container = await graph(env, "POST", `${ig}/media`, { image_url: items[0].url, caption });
  } else {
    const children = [];
    for (const item of items) {
      const child = await graph(env, "POST", `${ig}/media`, item.video
        ? { media_type: "VIDEO", video_url: item.url, is_carousel_item: "true" }
        : { image_url: item.url, is_carousel_item: "true" });
      children.push(child.id);
    }
    for (const id of children) await waitReady(env, id);
    container = await graph(env, "POST", `${ig}/media`, { media_type: "CAROUSEL", children: children.join(","), caption });
  }
  await waitReady(env, container.id);
  const published = await graph(env, "POST", `${ig}/media_publish`, { creation_id: container.id });
  const info = await graph(env, "GET", published.id, { fields: "permalink" }).catch(() => ({}));
  return info.permalink || published.id;
}

async function postFacebook(env, items, caption) {
  const page = env.FB_PAGE_ID;
  if (items.length === 1 && items[0].video) {
    const r = await graph(env, "POST", `${page}/videos`, { file_url: items[0].url, description: caption });
    return `video ${r.id}`;
  }
  const photos = items.filter((i) => !i.video);
  if (photos.length < items.length) console.warn("  Facebook: los videos no se pueden mezclar con fotos en un mismo post; se publican solo las fotos.");
  if (photos.length === 1) {
    const r = await graph(env, "POST", `${page}/photos`, { url: photos[0].url, caption, published: "true" });
    return `post ${r.post_id || r.id}`;
  }
  const attached = [];
  for (const photo of photos) {
    const r = await graph(env, "POST", `${page}/photos`, { url: photo.url, published: "false" });
    attached.push({ media_fbid: r.id });
  }
  const r = await graph(env, "POST", `${page}/feed`, { message: caption, attached_media: JSON.stringify(attached) });
  return `post ${r.id}`;
}

// ---------- comandos ----------
async function setup(env) {
  need(env, ["META_APP_ID", "META_APP_SECRET", "META_USER_TOKEN"]);
  const exchange = await fetch(`https://graph.facebook.com/${env.GRAPH_VERSION}/oauth/access_token?${new URLSearchParams({
    grant_type: "fb_exchange_token", client_id: env.META_APP_ID, client_secret: env.META_APP_SECRET, fb_exchange_token: env.META_USER_TOKEN
  })}`).then((r) => r.json());
  if (!exchange.access_token) fail(`No se pudo extender el token: ${exchange.error?.message || "respuesta vacía"}. Generá uno nuevo en el Graph API Explorer.`);

  const { data: pages } = await graph(env, "GET", "me/accounts", { fields: "id,name,access_token,instagram_business_account{id,username}" }, exchange.access_token);
  if (!pages.length) fail('El token no ve ninguna página. Revisá los permisos (pages_show_list) y, si la página está en un portfolio comercial, business_management.');

  const page = env.FB_PAGE_ID ? pages.find((p) => p.id === env.FB_PAGE_ID) : pages.length === 1 ? pages[0] : null;
  if (!page) {
    console.log("Páginas disponibles:");
    pages.forEach((p) => console.log(`  ${p.id}  ${p.name}  ${p.instagram_business_account ? `(Instagram @${p.instagram_business_account.username})` : "(sin Instagram vinculado)"}`));
    fail("Elegí una y ponela en FB_PAGE_ID dentro de social/.env, después volvé a correr setup.");
  }
  if (!page.instagram_business_account) fail(`La página "${page.name}" no tiene un Instagram profesional vinculado. Ver social/README.md, paso 1.`);

  saveEnv({ META_PAGE_TOKEN: page.access_token, FB_PAGE_ID: page.id, IG_USER_ID: page.instagram_business_account.id });
  console.log(`Listo. Página "${page.name}" e Instagram @${page.instagram_business_account.username} guardados en social/.env.`);
  console.log("Ya podés borrar la línea META_USER_TOKEN de ese archivo: el token de página queda guardado aparte.");
}

async function check(env) {
  need(env, ["META_PAGE_TOKEN", "FB_PAGE_ID", "IG_USER_ID"]);
  const page = await graph(env, "GET", env.FB_PAGE_ID, { fields: "name" });
  const ig = await graph(env, "GET", env.IG_USER_ID, { fields: "username" });
  console.log(`Facebook: ${page.name}\nInstagram: @${ig.username}\nTodo en orden.`);
}

function list(site) {
  for (const p of site.projects) {
    const pieces = postablePieces(p);
    const photos = pieces.filter((x) => x.type === "image").length;
    const videos = pieces.length - photos;
    console.log(`${p.slug.padEnd(30)} ${p.title}${p.detail ? ` · ${p.detail}` : ""}  ${pieces.length ? `${photos} fotos, ${videos} videos` : "(solo reproductor de Adobe, sin archivos)"}`);
  }
}

function resolveItems(env, site, args) {
  const project = findProject(site, args._[1]);
  const pieces = postablePieces(project);
  if (!pieces.length) fail(`"${project.slug}" no tiene archivos propios para publicar.`);
  const picks = parsePick(args.pick, pieces.length);
  if (!picks.length) fail("--pick no coincide con ninguna pieza.");
  if (picks.length > MAX_ITEMS) fail(`Un carrusel admite hasta ${MAX_ITEMS} piezas.`);
  const chosen = picks.map((n) => pieces[n - 1]);
  return { project, chosen, items: chosen.map((c) => ({ ...c, video: c.type === "video", url: publicUrl(env, project.slug, c) })) };
}

function prepare(env, site, args) {
  const { project, chosen } = resolveItems(env, site, args);
  const ratio = args.ratio ? args.ratio.split(":").reduce((a, b) => a / b) : null;
  for (const piece of chosen.filter((c) => c.type === "image")) console.log(`  ${prepareImage(project.slug, piece, ratio)}`);
  console.log("Fotos listas. Para que Meta las pueda leer hay que publicar la web: cd portfolio && vercel deploy --prod --yes");
}

function buildCaption(env, project, site, args) {
  if (args["caption-file"]) return fs.readFileSync(args["caption-file"], "utf8").trim();
  if (args.caption) return args.caption;
  const lines = [project.detail ? `${project.title} · ${project.detail}` : project.title];
  if (project.award) lines.push(`${project.award.name}${project.award.detail ? `: ${project.award.detail}` : ""}`);
  lines.push("", `${site.site.name} · ${site.site.descriptor}`, `${env.SITE_URL}/#/work/${project.slug}`);
  return lines.join("\n");
}

async function post(env, site, args) {
  const { project, chosen, items } = resolveItems(env, site, args);
  const targets = String(args.to || "ig,fb").split(",");
  const caption = buildCaption(env, project, site, args);

  console.log(`Proyecto: ${project.title}${project.detail ? ` · ${project.detail}` : ""}`);
  console.log(`Destinos: ${targets.join(", ")}  ·  piezas: ${items.length}`);
  items.forEach((i) => console.log(`  ${String(i.n).padStart(2)}. ${i.url}`));
  console.log(`\nTexto:\n${caption}\n`);
  if (items.length === 1 && items[0].video && items[0].ratio !== "portrait") console.warn("Aviso: el video no es vertical 9:16, en Reels se va a ver con bandas.");
  if (caption.length > 2200) fail("El texto supera los 2200 caracteres que admite Instagram.");

  if (!args.publish) return console.log("Simulación: no se publicó nada. Agregá --publish para publicar de verdad.");

  need(env, ["META_PAGE_TOKEN", "FB_PAGE_ID", "IG_USER_ID"]);
  await assertPublished(items);
  if (targets.includes("ig")) console.log(`Instagram: ${await postInstagram(env, items, caption)}`);
  if (targets.includes("fb")) console.log(`Facebook: ${await postFacebook(env, items, caption)}`);
}

// Publica láminas propias (por ejemplo, un carrusel exportado de Figma) en vez de fotos de un proyecto.
// Copia los JPG de la carpeta, en orden alfabético, a portfolio/media/_social/<nombre>/, porque Meta los
// descarga desde la web: después de la primera corrida hay que publicar el sitio.
async function postFiles(env, args) {
  const dir = args._[1];
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) fail('Uso: post-files <carpeta con JPG> --caption "..." | --caption-file texto.txt [--to ig,fb] [--publish]');
  const files = fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f)).sort();
  if (!files.length) fail(`No hay JPG en ${dir}. Instagram solo acepta JPG.`);
  if (files.length > MAX_ITEMS) fail(`Un carrusel admite hasta ${MAX_ITEMS} piezas; la carpeta tiene ${files.length}.`);
  if (!args.caption && !args["caption-file"]) fail('Falta el texto: --caption "..." o --caption-file texto.txt.');
  const caption = args["caption-file"] ? fs.readFileSync(args["caption-file"], "utf8").trim() : String(args.caption);
  if (caption.length > 2200) fail("El texto supera los 2200 caracteres que admite Instagram.");

  const name = path.basename(path.resolve(dir));
  const outDir = path.join(PORTFOLIO, "media", "_social", name);
  fs.mkdirSync(outDir, { recursive: true });
  const items = files.map((f, i) => {
    fs.copyFileSync(path.join(dir, f), path.join(outDir, f));
    return { n: i + 1, video: false, url: `${env.SITE_URL}/media/_social/${name}/${encodeURIComponent(f)}` };
  });
  const targets = String(args.to || "ig,fb").split(",");

  console.log(`Láminas: ${name}  ·  destinos: ${targets.join(", ")}  ·  piezas: ${items.length}`);
  items.forEach((i) => console.log(`  ${String(i.n).padStart(2)}. ${i.url}`));
  console.log(`\nTexto:\n${caption}\n`);
  if (!args.publish) return console.log("Simulación: no se publicó nada. Publicá la web (cd portfolio && vercel deploy --prod --yes) y agregá --publish.");

  need(env, ["META_PAGE_TOKEN", "FB_PAGE_ID", "IG_USER_ID"]);
  await assertPublished(items);
  if (targets.includes("ig")) console.log(`Instagram: ${await postInstagram(env, items, caption)}`);
  if (targets.includes("fb")) console.log(`Facebook: ${await postFacebook(env, items, caption)}`);
}

// ---------- entrada ----------
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      args[key] = next && !next.startsWith("--") ? (i++, next) : true;
    } else args._.push(argv[i]);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const env = loadEnv();
const commands = {
  setup: () => setup(env),
  check: () => check(env),
  list: () => list(loadSite()),
  prepare: () => prepare(env, loadSite(), args),
  post: () => post(env, loadSite(), args),
  "post-files": () => postFiles(env, args)
};
const run = commands[args._[0]];
if (!run) {
  // La ayuda es el comentario del encabezado de este archivo.
  const header = fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0].split("\n").slice(2);
  console.log(header.map((l) => l.replace(/^ \* ?/, "")).join("\n"));
  process.exit(args._[0] ? 1 : 0);
}
Promise.resolve(run()).catch((e) => fail(e.message));

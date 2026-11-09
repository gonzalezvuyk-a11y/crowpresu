/*
 * Contenido editable del portfolio. Todo lo que se ve en el sitio sale de acá,
 * no hace falta tocar HTML ni CSS para agregar un proyecto.
 *
 * Cada proyecto:
 *   slug      identificador único para la URL (#/work/<slug>)
 *   title     título corto
 *   detail    aclaración opcional (se ve atenuada)
 *   year      año
 *   category  Cobertura realtime | Contenido para marcas | Spots y campañas
 *   cover     cover(slug, ext, ancho, alto, ratio, posición) o null (mientras es null se muestra un bloque vacío).
 *             ratio da la forma de la portada en la grilla: portrait, square, landscape o wide.
 *   media     lista de piezas de la página del proyecto (ver más abajo)
 *   award     opcional, { name, detail }: premio que se muestra en la portada y en la página del proyecto
 *   cols      opcional: columnas de la página del proyecto (1 a 4); si falta, se elige según las piezas
 *
 * Piezas (media), todas con `ratio`: "landscape" (16:9), "portrait" (9:16) o "square":
 *   { type: "adobe",   id, ratio }                  reproductor de Adobe Portfolio
 *   { type: "vimeo",   id, ratio, title }
 *   { type: "youtube", id, ratio, title }
 *   { type: "video",   src, poster, ratio, title }  mp4 propio
 *   { type: "image",   src, alt, width, height, ratio }   ratio "natural" = proporción real, sin recortar
 *
 * Los archivos propios viven en portfolio/media/<slug>/.
 */
// Fotos de una galería (los datos están en photos.js). Se muestran con su proporción real, sin recortar.
const photos = (slug, label) =>
  (window.CROW_PHOTOS[slug] || []).map(([file, width, height], i) => ({
    type: "image",
    src: `media/${slug}/${file}`,
    small: `media/${slug}/${file.replace(".webp", "-800.webp")}`,
    width,
    height,
    ratio: "natural",
    alt: `${label}, foto ${i + 1}`
  }));
// Videos propios (mp4 sin audio, 720 px de ancho). Cada uno tiene su imagen fija: media/<slug>/<nombre>-poster.webp.
const clips = (slug, label, items, ratio = "portrait") =>
  items.map(([name, caption]) => ({
    type: "video",
    src: `media/${slug}/${name}.mp4`,
    poster: `media/${slug}/${name}-poster.webp`,
    ratio,
    title: `${label}, ${caption}`
  }));
const adobe = (ratio, ids) => ids.map((id) => ({ type: "adobe", id, ratio }));
// ratio: portrait (4:5) | square (1:1) | landscape (4:3) | wide (16:9). position: foco del recorte, ej. "50% 20%".
const cover = (slug, ext, width, height, ratio = "landscape", position = "") => ({
  src: `media/${slug}/cover.${ext}`,
  // Las portadas animadas son videos cortos en loop; el poster se ve mientras cargan.
  poster: ext === "mp4" ? `media/${slug}/poster.webp` : "",
  width, height, ratio, position
});

window.CROW = {
  site: {
    name: "theCrow.",
    tagline: "Always present.",
    intro: "Estudio de contenido visual que observa, interpreta y transforma momentos, ideas y experiencias en contenido relevante.",
    descriptor: "Estudio de contenido visual",
    servicesNote: "También editamos y montamos material para agencias y productoras. Escribinos.",
    timeZone: "America/Asuncion",
    instagram: { handle: "thecrowmedia", url: "https://www.instagram.com/thecrowmedia/" },
    facebook: { name: "TheCrow", url: "https://www.facebook.com/profile.php?id=61596594531030" },
    // Si quedan vacíos, no se muestran.
    email: "thecrowmedia@gmail.com",
    whatsapp: "+595 972 136903",
    whatsappMessage: "Hola theCrow., quiero consultar por contenido para mi marca o evento.",
    location: "Asunción, Paraguay",
    year: 2026
  },

  projects: [
    { slug: "broterra", title: "Broterra", detail: "Corrida", year: 2026, category: "Cobertura realtime", cover: cover("broterra", "mp4", 720, 900, "portrait"), media: photos("broterra", "Broterra, Corrida") },
    { slug: "veredas-extremas", title: "Veredas Extremas", detail: "Inclu+", year: 2026, category: "Spots y campañas", cover: cover("veredas-extremas", "mp4", 720, 540, "landscape"), cols: 3,
      award: { name: "Tatakuá de Plata", detail: "Micro spots (TV, cine y digital) hasta 15″ / campaña" },
      media: [...clips("veredas-extremas", "Veredas Extremas", [["spot", "Micro spot"]]), ...photos("veredas-extremas", "Veredas Extremas")] },
    { slug: "dia-de-la-chipa", title: "Día de la Chipa", detail: "HFF", year: 2026, category: "Spots y campañas", cover: cover("dia-de-la-chipa", "mp4", 720, 900, "portrait"),
      media: clips("dia-de-la-chipa", "Día de la Chipa", [["teaser", "Teaser"], ["capitulo-1", "Capítulo 1"], ["capitulo-2", "Capítulo 2"], ["historia-1", "Historia 1"], ["historia-2", "Historia 2"], ["historia-3", "Historia 3"]]) },
    { slug: "hydrate", title: "Hydrate", detail: "Aftermovie", year: 2026, category: "Cobertura realtime", cover: cover("hydrate", "mp4", 960, 540, "wide"),
      media: clips("hydrate", "Hydrate", [["aftermovie", "Aftermovie"]], "landscape") },
    { slug: "vero-vega", title: "Vero Vega", detail: "Jornada 2", year: 2026, category: "Contenido para marcas", cover: cover("vero-vega", "webp", 720, 900, "portrait"), media: photos("vero-vega", "Vero Vega") },
    { slug: "mk-trends", title: "MK Trends", detail: "", year: 2026, category: "Contenido para marcas", cover: cover("mk-trends", "mp4", 720, 720, "square"),
      media: clips("mk-trends", "MK Trends", [["reel", "Reel"]]) },
    { slug: "pilsen", title: "Pilsen", detail: "Torneo de Penales", year: 2026, category: "Cobertura realtime", cover: cover("pilsen", "mp4", 720, 540, "landscape"),
      media: [...clips("pilsen", "Pilsen, Torneo de Penales", [["recap", "Recap"], ["historia-3", "Historia 3"], ["historia-4", "Historia 4"], ["historia-7", "Historia 7"]]), ...photos("pilsen", "Pilsen, Torneo de Penales")] },
    { slug: "vogue", title: "Vogue", detail: "Belleza Latina", year: 2026, category: "Cobertura realtime", cover: cover("vogue", "mp4", 720, 900, "portrait"),
      media: clips("vogue", "Vogue, Belleza Latina", [["clip", "Clips"], ["loop-fotos", "Loop de fotos"]]) },
    { slug: "new-balance", title: "New Balance", detail: "Clips", year: 2026, category: "Cobertura realtime", cover: cover("new-balance", "mp4", 960, 540, "wide"),
      media: clips("new-balance", "New Balance", [["clips", "Clips"]]) },
    { slug: "aquabrava", title: "Aquabrava", detail: "Clips", year: 2026, category: "Contenido para marcas", cover: cover("aquabrava", "mp4", 720, 720, "square"),
      media: clips("aquabrava", "Aquabrava", [["clips", "Clips"]]) },
    { slug: "contenido-2026", title: "Contenido", detail: "", year: 2026, category: "Contenido para marcas", cover: cover("contenido-2026", "jpg", 640, 500, "portrait"),
      media: adobe("portrait", ["NLH_VEjkjbK", "A3vG2idBue9", "RFQIIQF-_6f", "5AgE9_2ZSHE", "PTEmhZvthoi", "VoDq4XzWbs3"]) },
    { slug: "clips-2026", title: "Clips", detail: "", year: 2026, category: "Contenido para marcas", cover: cover("clips-2026", "jpg", 640, 500, "square"),
      media: adobe("portrait", ["7pgDir9Dujw", "D-yRWko5aBu", "LRV8LmLILoI", "-BpX2UQQsrv"]) },
    { slug: "fotografia-real-time-2026", title: "Fotografía", detail: "Real Time", year: 2026, category: "Cobertura realtime", cover: cover("fotografia-real-time-2026", "webp", 720, 900, "portrait"), media: photos("fotografia-real-time-2026", "Fotografía, Real Time") },
    { slug: "real-time-fotos-2025", title: "Real Time", detail: "Fotos", year: 2025, category: "Cobertura realtime", cover: cover("real-time-fotos-2025", "webp", 720, 720, "square"), media: photos("real-time-fotos-2025", "Real Time, Fotos") },
    { slug: "louis-tomlinson", title: "Louis Tomlinson", detail: "Buenos Aires", year: 2024, category: "Cobertura realtime", cover: cover("louis-tomlinson", "mp4", 452, 354, "wide"),
      media: adobe("landscape", ["PwCERxhfvYb"]) },
    { slug: "stephi-stegman-videos", title: "Stephi Stegman", detail: "Videos", year: 2024, category: "Contenido para marcas", cover: cover("stephi-stegman-videos", "jpeg", 640, 501, "portrait"),
      media: adobe("portrait", ["MwzfQRwHTyG", "BAhhc_a2gTS", "Exwp-ujS_pX", "GUE5kBFoFTF"]) },
    { slug: "stephi-stegman-fotos", title: "Stephi Stegman", detail: "Fotos", year: 2024, category: "Contenido para marcas", cover: cover("stephi-stegman-fotos", "webp", 720, 720, "square"), media: photos("stephi-stegman-fotos", "Stephi Stegman, Fotos") },
    { slug: "8m-trece", title: "8M", detail: "TRECE", year: 2024, category: "Contenido para marcas", cover: cover("8m-trece", "mp4", 452, 354, "wide"),
      media: adobe("landscape", ["WKDWyy5A32_"]) },
    { slug: "dia-de-la-madre-trece", title: "Día de la Madre", detail: "TRECE", year: 2023, category: "Contenido para marcas", cover: cover("dia-de-la-madre-trece", "mp4", 452, 354, "landscape"),
      media: adobe("landscape", ["9_NisvJZnQ2"]) },
    { slug: "barbie-avant-premiere", title: "Barbie", detail: "Avant Premiere, la película", year: 2023, category: "Cobertura realtime", cover: cover("barbie-avant-premiere", "mp4", 630, 492, "portrait"),
      media: adobe("portrait", ["QQNPivPPhbb"]) },
    { slug: "reels-redes-sociales", title: "Reels", detail: "Redes sociales", year: 2024, category: "Contenido para marcas", cover: cover("reels-redes-sociales", "mp4", 452, 354, "square"),
      media: adobe("portrait", [
        "JC6zzT-TmQv", "IS3ZcnUcgEp", "LuSs8JYpUrD", "QXXYJAX3MAC", "4S4APyqzfyk", "94r7A_WEvvP", "3Q2L2J-Qcaa",
        "GAfAIBgBX6-", "3_-jTI4IGRn", "MowbM4IHXK-", "UcmVMoN8KNT", "9-GRKxhZS7a", "Aq2fjbEx_6u", "KtiZq8hdcGu",
        "9iqPbb_rghR", "7vE7kzU6ppx", "5rsXMQWyubX", "AVB3zNIFdiP", "CZQyQ3As_Jc", "9FL9jNEJJmX"
      ]) },
    { slug: "asuncionico-aftermovie", title: "Asuncionico", detail: "Aftermovie", year: 2024, category: "Spots y campañas", cover: cover("asuncionico-aftermovie", "mp4", 452, 354, "portrait"),
      media: adobe("portrait", ["PIp49DgVWPJ"]) },
    { slug: "leal-ii-avant-premiere", title: "Leal II", detail: "Avant Premiere", year: 2023, category: "Cobertura realtime", cover: cover("leal-ii-avant-premiere", "mp4", 452, 354, "wide"),
      media: adobe("landscape", ["5KrtHk5-AcV"]) },
    { slug: "eladio-carrion-recap", title: "Eladio Carrión", detail: "Recap", year: 2023, category: "Cobertura realtime", cover: cover("eladio-carrion-recap", "png", 452, 354, "portrait"),
      media: adobe("portrait", ["EIsQIg84YzN"]) },
    { slug: "cosquin-aftermovie", title: "Cosquín", detail: "Aftermovie", year: 2023, category: "Spots y campañas", cover: cover("cosquin-aftermovie", "mp4", 452, 354, "landscape"),
      media: adobe("portrait", ["RbLXUZiCR8b"]) }
  ],

  // Clientes del marquee de la home. Con `logo` se muestra la imagen (assets/clients/); sin `logo`, el nombre en texto.
  // `w`/`h` son el tamaño de la imagen (para reservar el espacio) y `size` el alto en rem, para igualar el peso visual entre logos.
  clients: [
    { name: "Bancard", logo: "bancard.webp", w: 192, h: 36, size: 1.5 },
    { name: "New Balance", logo: "new-balance-wordmark.svg", w: 300, h: 165, size: 2.4 },
    { name: "Aposta.la", logo: "aposta-wordmark.webp", w: 254, h: 96, size: 1.7 },
    { name: "Broterra", logo: "broterra-sm.webp", w: 140, h: 120, size: 2.6 },
    { name: "Pilsen", logo: "pilsen.webp", w: 324, h: 292, size: 2.6 },
    { name: "Sistema B", logo: "sistema-b.svg", w: 247, h: 352, size: 2.6 },
    { name: "Pacto Global", logo: "pacto.webp", w: 356, h: 126, size: 2.2 },
    { name: "Bolt", logo: "bolt.svg", w: 68.75, h: 40, size: 1.8 },
    { name: "MKT Trends", logo: "mkt-trends-sm.webp", w: 910, h: 120, size: 1.2 },
    { name: "Campesino", logo: "campesino.webp", w: 678, h: 238, size: 2 },
    { name: "Hijas de Feliciana", logo: "feliciana-sm.webp", w: 188, h: 120, size: 2.6 },
    { name: "23 Sports", logo: "23-sports-sm.webp", w: 286, h: 120, size: 2.2 },
    { name: "Icon", logo: "icon.webp", w: 300, h: 108, size: 1.8 },
    { name: "Koga", logo: "koga-wordmark.webp", w: 352, h: 98, size: 1.6 },
    { name: "Pastas Anita", logo: "anita.webp", w: 440, h: 274, size: 2.6 },
    { name: "Sotheby's", logo: "sothebys.svg", w: 112, h: 30, size: 1.6 },
    { name: "Raíces Real Estate", logo: "raices.webp", w: 496, h: 156, size: 1.9 },
    { name: "Brandon", logo: "brandon.webp", w: 508, h: 88, size: 1.2 },
    { name: "Módiga", logo: "modiga-wordmark.webp", w: 786, h: 214, size: 1.7 },
    { name: "Rock & Pop 95.5", logo: "rock-and-pop.svg", w: 468, h: 500, size: 2.6 }
  ],
  services: [
    { name: "Cobertura realtime", text: "Cobertura de eventos y experiencias en tiempo real: fotos y video mientras pasa, para que tu marca publique en el momento." },
    { name: "Contenido para marcas", text: "Fotografía, video y edición para marcas, con continuidad mes a mes." },
    { name: "Spots y campañas", text: "Narrativas y piezas visuales para campañas y proyectos especiales. Veredas Extremas ganó un Tatakuá de Plata en micro spots." }
  ]
};

/*
 * Contenido editable del portfolio. Todo lo que se ve en el sitio sale de acá,
 * no hace falta tocar HTML ni CSS para agregar un proyecto.
 *
 * Cada proyecto:
 *   slug      identificador único para la URL (#/work/<slug>)
 *   title     título corto
 *   detail    aclaración opcional (se ve atenuada)
 *   year      año
 *   category  Content Production | Live Content | Post-production | Visual Storytelling
 *   cover     cover(slug, ext, ancho, alto, ratio, posición) o null (mientras es null se muestra un bloque vacío).
 *             ratio da la forma de la portada en la grilla: portrait, square, landscape o wide.
 *   media     lista de piezas de la página del proyecto (ver más abajo)
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
    width,
    height,
    ratio: "natural",
    alt: `${label}, foto ${i + 1}`
  }));
const adobe = (ratio, ids) => ids.map((id) => ({ type: "adobe", id, ratio }));
// ratio: portrait (4:5) | square (1:1) | landscape (4:3) | wide (16:9). position: foco del recorte, ej. "50% 20%".
const cover = (slug, ext, width, height, ratio = "landscape", position = "") => ({ src: `media/${slug}/cover.${ext}`, width, height, ratio, position });

window.CROW = {
  site: {
    name: "theCrow.",
    tagline: "Always present.",
    intro: "Estudio de contenido visual que observa, interpreta y transforma momentos, ideas y experiencias en contenido relevante.",
    descriptor: "Estudio de contenido visual",
    timeZone: "America/Asuncion",
    instagram: { handle: "thecrowmedia", url: "https://www.instagram.com/thecrowmedia/" },
    // Si quedan vacíos, no se muestran.
    email: "thecrowmedia@gmail.com",
    whatsapp: "+595 972 136903",
    whatsappMessage: "Hola theCrow., quiero consultar por contenido para mi marca o evento.",
    location: "Asunción, Paraguay",
    year: 2026
  },

  projects: [
    { slug: "contenido-2026", title: "Contenido", detail: "", year: 2026, category: "Content Production", cover: cover("contenido-2026", "jpg", 640, 500, "portrait"),
      media: adobe("portrait", ["NLH_VEjkjbK", "A3vG2idBue9", "RFQIIQF-_6f", "5AgE9_2ZSHE", "PTEmhZvthoi", "VoDq4XzWbs3"]) },
    { slug: "clips-2026", title: "Clips", detail: "", year: 2026, category: "Post-production", cover: cover("clips-2026", "jpg", 640, 500, "square"),
      media: adobe("portrait", ["7pgDir9Dujw", "D-yRWko5aBu", "LRV8LmLILoI", "-BpX2UQQsrv"]) },
    { slug: "fotografia-real-time-2026", title: "Fotografía", detail: "Real Time", year: 2026, category: "Live Content", cover: cover("fotografia-real-time-2026", "webp", 720, 900, "portrait"), media: photos("fotografia-real-time-2026", "Fotografía, Real Time") },
    { slug: "real-time-fotos-2025", title: "Real Time", detail: "Fotos", year: 2025, category: "Live Content", cover: cover("real-time-fotos-2025", "webp", 720, 720, "square"), media: photos("real-time-fotos-2025", "Real Time, Fotos") },
    { slug: "louis-tomlinson", title: "Louis Tomlinson", detail: "Buenos Aires", year: 2024, category: "Live Content", cover: cover("louis-tomlinson", "gif", 452, 354, "wide"),
      media: adobe("landscape", ["PwCERxhfvYb"]) },
    { slug: "stephi-stegman-videos", title: "Stephi Stegman", detail: "Videos", year: 2024, category: "Content Production", cover: cover("stephi-stegman-videos", "jpeg", 640, 501, "portrait"),
      media: adobe("portrait", ["MwzfQRwHTyG", "BAhhc_a2gTS", "Exwp-ujS_pX", "GUE5kBFoFTF"]) },
    { slug: "stephi-stegman-fotos", title: "Stephi Stegman", detail: "Fotos", year: 2024, category: "Content Production", cover: cover("stephi-stegman-fotos", "webp", 720, 720, "square"), media: photos("stephi-stegman-fotos", "Stephi Stegman, Fotos") },
    { slug: "8m-trece", title: "8M", detail: "TRECE", year: 2024, category: "Content Production", cover: cover("8m-trece", "gif", 452, 354, "wide"),
      media: adobe("landscape", ["WKDWyy5A32_"]) },
    { slug: "dia-de-la-madre-trece", title: "Día de la Madre", detail: "TRECE", year: 2023, category: "Content Production", cover: cover("dia-de-la-madre-trece", "gif", 452, 354, "landscape"),
      media: adobe("landscape", ["9_NisvJZnQ2"]) },
    { slug: "barbie-avant-premiere", title: "Barbie", detail: "Avant Premiere, la película", year: 2023, category: "Live Content", cover: cover("barbie-avant-premiere", "gif", 630, 492, "portrait"),
      media: adobe("portrait", ["QQNPivPPhbb"]) },
    { slug: "reels-redes-sociales", title: "Reels", detail: "Redes sociales", year: 2024, category: "Content Production", cover: cover("reels-redes-sociales", "gif", 452, 354, "square"),
      media: adobe("portrait", [
        "JC6zzT-TmQv", "IS3ZcnUcgEp", "LuSs8JYpUrD", "QXXYJAX3MAC", "4S4APyqzfyk", "94r7A_WEvvP", "3Q2L2J-Qcaa",
        "GAfAIBgBX6-", "3_-jTI4IGRn", "MowbM4IHXK-", "UcmVMoN8KNT", "9-GRKxhZS7a", "Aq2fjbEx_6u", "KtiZq8hdcGu",
        "9iqPbb_rghR", "7vE7kzU6ppx", "5rsXMQWyubX", "AVB3zNIFdiP", "CZQyQ3As_Jc", "9FL9jNEJJmX"
      ]) },
    { slug: "asuncionico-aftermovie", title: "Asuncionico", detail: "Aftermovie", year: 2024, category: "Visual Storytelling", cover: cover("asuncionico-aftermovie", "gif", 452, 354, "portrait"),
      media: adobe("portrait", ["PIp49DgVWPJ"]) },
    { slug: "leal-ii-avant-premiere", title: "Leal II", detail: "Avant Premiere", year: 2023, category: "Live Content", cover: cover("leal-ii-avant-premiere", "gif", 452, 354, "wide"),
      media: adobe("landscape", ["5KrtHk5-AcV"]) },
    { slug: "eladio-carrion-recap", title: "Eladio Carrión", detail: "Recap", year: 2023, category: "Live Content", cover: cover("eladio-carrion-recap", "png", 452, 354, "portrait"),
      media: adobe("portrait", ["EIsQIg84YzN"]) },
    { slug: "cosquin-aftermovie", title: "Cosquín", detail: "Aftermovie", year: 2023, category: "Visual Storytelling", cover: cover("cosquin-aftermovie", "gif", 452, 354, "landscape"),
      media: adobe("portrait", ["RbLXUZiCR8b"]) }
  ],

  services: [
    { name: "Content Production", text: "Fotografía, video y contenido para marcas." },
    { name: "Live Content", text: "Cobertura de eventos y experiencias con producción y entrega ágil." },
    { name: "Post-production", text: "Edición audiovisual, montaje y contenido recurrente." },
    { name: "Visual Storytelling", text: "Narrativas y piezas visuales para campañas y proyectos especiales." }
  ]
};

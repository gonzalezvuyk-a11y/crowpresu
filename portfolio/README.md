# theCrow. — Portfolio

Sitio estático, sin build ni dependencias. Estructura inspirada en nolan-barret.framer.website: fondo claro, header con reloj de Asunción, frase de presentación, barra con selector de columnas y grilla de proyectos con epígrafes en mono. Cada proyecto tiene su página con las piezas. Identidad: paleta y logos del brief de marca (negro cálido `#151515`, beige `#CDB7A4`, rojo vino `#78251D`) sobre un fondo papel `#F3F0EB`.

## Correrlo

```bash
cd portfolio
python3 -m http.server 4173
```

Abrí http://localhost:4173.

## Publicación

Está publicado en Vercel como un proyecto aparte (`thecrow-portfolio`), separado de la app de presupuestos: https://thecrow-portfolio.vercel.app

El proyecto **no** está conectado a GitHub, así que un push no lo actualiza. Para publicar cambios:

```bash
cd portfolio
node scripts/deploy.mjs
```

El script agrega `?v=<hash>` a los archivos de código (`scripts/` y `styles/`, en `index.html` y en los `@import` de `styles/main.css`), publica con `vercel deploy --prod --yes` y deja los archivos locales como estaban. El hash sale del contenido, así que solo cambia cuando cambia el código. Sirve para que todos los navegadores bajen la versión nueva apenas vuelven a entrar, incluidos los de WhatsApp e Instagram, que guardan las páginas más tiempo. Con `--dry` muestra qué cambiaría sin publicar. Las fotos y videos no lo necesitan: cuando se reemplaza una portada, va con nombre nuevo (`cover.v2.webp`). Publicar con `vercel deploy` a secas sigue funcionando, pero sin la versión.

**Dominio propio:** https://thecrowfilm.com (registrado en GoDaddy). `www.thecrowfilm.com` redirige al dominio principal y `http` redirige a `https`, con certificado de Let's Encrypt que Vercel renueva solo. Registros DNS en GoDaddy: `A @` hacia `216.198.79.1` y `CNAME www` hacia `1550be9ff3197e34.vercel-dns-017.com`; los demás (NS, SOA, `_domainconnect`, `_dmarc`) quedaron como estaban. Si se cambia de proveedor de DNS, hay que repetir esos dos registros. La dirección `thecrow-portfolio.vercel.app` sigue funcionando. `vercel.json` define el caché de `media/` y `assets/` (7 días) y encabezados de seguridad básicos.

## Imagen para compartir, íconos y SEO

- **Imagen para compartir** (`og.png`, 1200×630): la que aparece al pegar el link en WhatsApp, Instagram, LinkedIn, X o Facebook. Es el logotipo beige sobre negro cálido, con la barra vino. Incluye el sello del Tatakuá y "Tatakuá de Plata · Veredas Extremas". Las etiquetas `og:` y `twitter:` están en el `<head>` de `index.html`.
- **Íconos**: el isotipo "tC" negro sobre fondo blanco, en `favicon.ico`, `assets/icons/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (iPhone) e `icon-192.png` / `icon-512.png` (los de `site.webmanifest`).
- **Regenerar todo**: `portfolio/brand/build.sh`. Dibuja `brand/og.html` y `brand/icon.html` con Google Chrome sin ventana y reduce los tamaños con ffmpeg. Para cambiar el texto o el diseño, editar esos dos HTML y volver a correr el script. La carpeta `brand/` no se publica (`.vercelignore`).
- **Cuando se cambia la imagen**, WhatsApp, Facebook y LinkedIn guardan la vieja varios días. Para forzar la actualización: Facebook Sharing Debugger (developers.facebook.com/tools/debug) y LinkedIn Post Inspector, con el botón de volver a leer la página.
- **Buscadores**: `robots.txt`, `sitemap.xml`, dirección canónica y datos estructurados (`ProfessionalService` con nombre, correo, teléfono e Instagram). `404.html` es la página de error con la identidad del sitio.
- **Límite conocido**: las vistas usan `#/` en la dirección, y ni Google ni los previews leen lo que viene después del `#`. Por eso todos los links se ven con la misma imagen y descripción, y Google solo indexa la portada. Para que cada proyecto tenga su propio link, imagen y posicionamiento, hay que pasar a direcciones reales (`/work/<proyecto>`) con una página por proyecto.

## Agregar o editar un proyecto

Todo el contenido está en `scripts/data/site.js`.

1. Portada: copiá la imagen a `media/<slug>/cover.<ext>` y completá `cover` con `cover(slug, ext, ancho, alto, ratio, posición)`. El `ratio` es la forma de la portada en la grilla: `portrait` (4:5), `square` (1:1), `landscape` (4:3) o `wide` (16:9); se recorta la imagen para llenarla. La `posición` es opcional y mueve el foco del recorte, por ejemplo `"50% 10%"` para priorizar la parte de arriba (por defecto `50% 30%`).
2. Piezas: completá `media`. Cada pieza lleva `ratio` (`landscape`, `portrait` o `square`).
   - Reproductor de Adobe Portfolio: `{ type: "adobe", id, ratio }`. El `id` es el tramo entre `/ccv/` y `/embed` de la URL del reproductor.
   - Vimeo o YouTube: `{ type: "vimeo", id: "123456789", ratio, title }`.
   - Video propio: `{ type: "video", src, poster, ratio, title }`. Para varios videos de un proyecto, usar el helper `clips(slug, etiqueta, [[nombre, texto], ...])` de `site.js`, que espera `media/<slug>/<nombre>.mp4` y `media/<slug>/<nombre>-poster.webp`. Conversión recomendada (sin audio, 720 px de ancho para verticales, 1280 px para horizontales; 1 a 9 MB cada uno): `ffmpeg -i original.mov -an -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -profile:v high -movflags +faststart -vf scale=720:-2 nombre.mp4`. El poster es un cuadro del video en WebP (`cwebp -q 76`).
   - Imagen: `{ type: "image", src, alt, ratio }`.

Mientras `media` esté vacío, la página del proyecto muestra "Material en carga".

Para mostrar un premio en un proyecto, agregar `award: { name: "Tatakuá de Plata", detail: "categoría o aclaración" }`. Aparece como un sello azul sobre la portada, el nombre debajo del título en la grilla, un banner azul con el detalle en la página del proyecto y una entrada en "Reconocimientos" de Estudio. "Veredas Extremas" lo lleva. El ícono (`assets/awards/tatakua.svg`: arco blanco con rayos amarillos, pensado para fondo azul) es un dibujo hecho a partir de una captura del premio, no el archivo oficial: si el Tatakuá entrega el logo oficial, reemplazar ese archivo mantiene todo lo demás. `cols` (opcional) fija las columnas de la página del proyecto.

## Estado actual del material

- Las 15 portadas, las fotos y los reproductores de video salen de roxannasoy.com. Los videos se incrustan desde el Adobe de Roxanna: si ese portfolio se cierra, dejan de verse. Para independizarse hay que subirlos a Vimeo o YouTube y cambiar el `type`.
- Las tres galerías de fotos (159 fotos) están en `media/<slug>/NN.webp`, convertidas a WebP de hasta 1200 px. Sus datos (archivo, ancho, alto) están en `scripts/data/photos.js`. Cada foto tiene además una versión de 800 px (`NN-800.webp`) que el navegador usa cuando la foto se ve chica; se arma con `cwebp -resize 800 0 -q 74 NN.webp -o NN-800.webp`. Para sumar fotos a una galería: copiarlas a la carpeta del proyecto como `.webp`, crear su versión de 800 px y agregar su fila en `photos.js`.
- Las portadas de las galerías de fotos (Fotografía Real Time, Real Time Fotos y Stephi Stegman Fotos) son WebP animados de 8 fotos. Se arman con `img2webp` a partir de las fotos de cada galería.
- Ocho portadas animadas son videos mp4 cortos y silenciosos en loop (`media/<slug>/cover.mp4` más `poster.webp`, que se ve mientras carga). Pesan 2 MB en total; antes eran GIFs de 29 MB. No descargan nada hasta que entran en pantalla y se pausan al salir. Con "reducir movimiento" activado quedan en el poster. Para sumar una portada animada: `ffmpeg -i origen.mov -an -c:v libx264 -crf 27 -pix_fmt yuv420p -movflags +faststart cover.mp4`, un `poster.webp` con el primer cuadro, y en `site.js` usar `cover(slug, "mp4", ancho, alto, ratio)`. Evitar GIFs: pesan 10 a 15 veces más.
- Los proyectos de la carpeta `selected works/` (Día de la Chipa, Veredas Extremas —el micro spot ganador y 5 piezas—, Hydrate, Vero Vega, MK Trends, Pilsen, Vogue, New Balance y Aquabrava) se subieron como versión web: videos en mp4 de 720 px, fotos en WebP de 1200 px y portadas en loop. Los originales (3,6 GB) no están en el repositorio ni en el sitio. Los títulos salen de los nombres de carpetas y archivos, y los años (2026) de las fechas de los archivos: revisarlos.
- Los títulos, años y categorías de los proyectos de roxannasoy.com salen de esa selección. Las categorías de todos son una asignación inicial: revisarlas. Son las tres ofertas del estudio: *Cobertura realtime*, *Contenido para marcas* y *Spots y campañas* (los textos de esas ofertas están en `services` de `site.js` y se ven en Estudio).

## Datos de contacto

Están en `site.js`: `email`, `whatsapp`, `whatsappMessage` (el mensaje que llega precargado al abrir el chat) y `location`. Si `email` o `whatsapp` quedan vacíos, no se muestran.

## Estructura

```
index.html
styles/        tokens.css · base.css · layout.css · components/*.css · main.css (orden con @layer)
scripts/       main.js (router por hash, vistas, selector de columnas, reloj) · motion.js (Lenis + GSAP) · data/site.js (contenido)
assets/logo/   isotipo y logotipo, en beige y en negro
media/         portadas por proyecto
```

## Decisiones

- Navegación por hash (`#/work/<slug>`): una sola página, sin servidor. Al cambiar de vista se actualiza `<title>` y el foco pasa al `h1`.
- Tipografías: Inter Tight (texto) e IBM Plex Mono (epígrafes), de Google Fonts. No se usan las TT Norms de `/assets/fonts` porque son una versión de prueba (trial) y no están licenciadas para producción.
- Colores: en hover, el texto y el logo cambian al beige `#CFB9A6` (`--color-accent`); las portadas y "Siguiente" además se subrayan. Sobre el fondo claro el beige tiene poco contraste (cerca de 1,6:1), así que se usa solo en hover. El rojo vino queda solo para el anillo de foco del teclado.
- El logo del header es una máscara CSS del SVG (`assets/logo/crow-ink-logotipo.svg`), para que pueda cambiar de color en hover. Para pasar a una versión oscura alcanza con cambiar los colores de `styles/tokens.css` y usar el logo beige.
- El selector de columnas solo se muestra desde tablet; en mobile la grilla es fija.

## Movimiento

`scripts/motion.js` usa Lenis 1.3.27 (scroll suave) y GSAP 3.13.0 con ScrollTrigger y Flip. Las librerías se cargan por CDN con versión fija y hash de integridad (SRI) en `index.html`. Si se actualiza una versión, hay que recalcular el hash.

- Frase de inicio: entra palabra por palabra desde una máscara.
- Portadas y piezas: entran en tandas al llegar a la pantalla (opacidad, desplazamiento y un zoom suave de la imagen).
- Selector de columnas: las tarjetas se desplazan a su lugar nuevo con Flip.
- Cambio de vista: el título y los bloques entran, y el scroll vuelve arriba. Los triggers de la vista anterior se eliminan.
- Con "reducir movimiento" activado en el sistema no corre nada de esto: sin scroll suave y con todo visible. Lo mismo pasa si las librerías no cargan.
- Para ajustar el ritmo, los valores están en `motion.js` (`duration`, `stagger`) y la suavidad del scroll en `new Lenis({ lerp })`.

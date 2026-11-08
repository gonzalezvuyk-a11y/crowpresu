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
vercel deploy --prod --yes
```

Para sumar el dominio propio: Vercel, proyecto `thecrow-portfolio`, Settings, Domains. Después de comprarlo, hay que apuntar el DNS a Vercel y agregar el dominio ahí. `vercel.json` define el caché de `media/` y `assets/` (7 días) y encabezados de seguridad básicos.

## Agregar o editar un proyecto

Todo el contenido está en `scripts/data/site.js`.

1. Portada: copiá la imagen a `media/<slug>/cover.<ext>` y completá `cover` con `cover(slug, ext, ancho, alto, ratio, posición)`. El `ratio` es la forma de la portada en la grilla: `portrait` (4:5), `square` (1:1), `landscape` (4:3) o `wide` (16:9); se recorta la imagen para llenarla. La `posición` es opcional y mueve el foco del recorte, por ejemplo `"50% 10%"` para priorizar la parte de arriba (por defecto `50% 30%`).
2. Piezas: completá `media`. Cada pieza lleva `ratio` (`landscape`, `portrait` o `square`).
   - Reproductor de Adobe Portfolio: `{ type: "adobe", id, ratio }`. El `id` es el tramo entre `/ccv/` y `/embed` de la URL del reproductor.
   - Vimeo o YouTube: `{ type: "vimeo", id: "123456789", ratio, title }`.
   - Video propio: `{ type: "video", src, poster, ratio, title }`.
   - Imagen: `{ type: "image", src, alt, ratio }`.

Mientras `media` esté vacío, la página del proyecto muestra "Material en carga".

## Estado actual del material

- Las 15 portadas, las fotos y los reproductores de video salen de roxannasoy.com. Los videos se incrustan desde el Adobe de Roxanna: si ese portfolio se cierra, dejan de verse. Para independizarse hay que subirlos a Vimeo o YouTube y cambiar el `type`.
- Las tres galerías de fotos (169 fotos) están en `media/<slug>/NN.webp`, convertidas a WebP de hasta 1200 px. Sus datos (archivo, ancho, alto) están en `scripts/data/photos.js`. Para sumar fotos a una galería: copiarlas a la carpeta del proyecto como `.webp` y agregar su fila en `photos.js`.
- Las portadas de las galerías de fotos (Fotografía Real Time, Real Time Fotos y Stephi Stegman Fotos) son WebP animados de 8 fotos. Se arman con `img2webp` a partir de las fotos de cada galería.
- Nueve portadas son GIFs animados de entre 1,9 y 5,8 MB cada uno (unos 30 MB en total). Pesan mucho para la página de inicio. Si la carga se siente lenta, hay que reemplazarlos por WebP animado.
- Los títulos, años y categorías salen de la selección de roxannasoy.com. Las categorías son una asignación inicial: revisarlas.

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

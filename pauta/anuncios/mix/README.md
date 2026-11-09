# Mix de pauta (15 s) · DaVinci Resolve

Un solo anuncio que muestra los tres productos con cortes rápidos de fotos y videos. Reemplaza a los dos anuncios anteriores cuando el presupuesto alcanza para uno solo.

- **Video final:** `../anuncio-3-mix.mp4` (1080×1920, 30 fps, H.264, 15 s, con pista de audio silenciosa). Portada sugerida: `../anuncio-3-miniatura.jpg`.
- **Proyecto editable:** "theCrow Pauta Mix" en la base de datos local de DaVinci Resolve, línea de tiempo "Mix 15s". Los títulos van en V2, encima de las tomas en V1, así se pueden mover cortes sin rehacer textos.
- **Fuentes:** `fuentes/` tiene los HTML de los textos, la lista de fotos (`fotos.txt`) y `build.sh`, que regenera las capas y los clips para Resolve.

## Versión en After Effects

`after/theCrow-Pauta-Mix.aep` (After Effects 2026) es el mismo mix, cuadro por cuadro, con los textos editables.

- **Composición principal:** `01 Comps/Mix 15s` (1080×1920, 30 fps, 15 s). Tiene marcadores en cada sección.
- **Textos editables:** cada título es una precomposición con texto nativo, en `01 Comps/Precomps`: `Título · 01 Cobertura`, `02 Marcas` y `03 Spots` (este con el sello del Tatakuá como forma y texto), además de `Gancho · Logo` y `Tarjeta final`. Para cambiar una palabra, se abre la precomposición y se edita la capa de texto.
- **Material original:** usa los videos de `selected works/` y las fotos originales en alta resolución, no los clips intermedios de Resolve. Así cada foto se puede reencuadrar moviendo o escalando su capa.
- **Logos:** `after/graficos/` tiene los logos y el sello en PNG, sacados de los SVG del portfolio.
- **Render:** la cola de render ya está configurada en H.264 hacia `after/render/mix-15s-after.mp4`.
- Los videos de 24 fps, salvo Hydrate, están corridos medio cuadro de origen para tomar el mismo cuadro que Resolve. Si no, en un corte de Día de la Chipa entraba un cuadro con el subtítulo "Centro Histórico".
- **Tipografías:** necesita Inter Tight e IBM Plex Mono instaladas.

## Estructura (30 fps, 450 cuadros)

| Cuadros | Tiempo | V1 (tomas) | V2 (texto) |
|---|---|---|---|
| 0–59 | 0–2 s | 10 fotos de 6 cuadros: Vero Vega y Broterra | "theCrow." desde el cuadro 40 |
| 60–164 | 2–5,5 s | New Balance, Hydrate y Vogue, 15 cuadros cada toma | 01 / 03 Cobertura realtime |
| 165–269 | 5,5–9 s | Aquabrava y fotos de Broterra y Vero Vega (8–15 cuadros) | 02 / 03 Contenido para marcas |
| 270–374 | 9–12,5 s | Veredas Extremas y Día de la Chipa (HFF), tomas sin subtítulos | 03 / 03 Spots y campañas + sello Tatakuá de Plata |
| 375–449 | 12,5–15 s | Tarjeta final: logo, productos, "Escribinos por WhatsApp", thecrowfilm.com | — |

Los cortes caen en una grilla pensada para música de 120 BPM (15 cuadros por pulso).

## Antes de publicar

- [ ] **Música:** el video no trae sonido. Elegir un tema de ~120 BPM con licencia comercial (por ejemplo, de la biblioteca de sonidos de Meta al cargar el anuncio) o sumarlo en Resolve y volver a exportar.
- [ ] **Permisos de marcas que aparecen:** New Balance, Hydrate, Vogue, Aquabrava, Broterra, Vero Vega, Inclu+ (Veredas Extremas) y HFF (Día de la Chipa). Pilsen queda afuera por la regla de alcohol de Meta.
- [ ] **Tipografía:** los textos usan Inter Tight e IBM Plex Mono, que tienen licencia libre. TT Norms Pro Mono no se usó porque la que tenemos es Trial.

## Texto para Ads Manager

- **Texto principal:** `Cobertura realtime, contenido para marcas, spots y campañas. Estudio de contenido visual en Asunción. Escribinos.`
- **Título:** `theCrow. · Estudio de contenido visual`
- **Botón:** Enviar mensaje (WhatsApp)
- **Nombre del anuncio:** `A3 | Mix productos`

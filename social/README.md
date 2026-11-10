# Publicar en Instagram y Facebook

Script (`cli.mjs`) que toma un proyecto del portfolio (`portfolio/scripts/data/site.js`) y lo publica en la cuenta de Instagram y la página de Facebook de theCrow. con la Graph API de Meta. No tiene dependencias: necesita Node 18+ y ffmpeg.

Por defecto **simula**: muestra qué subiría y con qué texto, y no publica nada hasta que se agrega `--publish`.

## Selector de posteos (elegir las fotos del feed)

Una página local para armar los posteos de Instagram sin escribir nada a mano: elegís fotos de cualquier proyecto del portfolio, las ordenás y definís el texto de cada posteo. Es independiente de la publicación por API de más abajo y no necesita configuración ni tokens.

```bash
node social/selector/server.mjs      # → http://127.0.0.1:4180
```

En la app de escritorio también se abre desde el panel del navegador con la configuración `selector-de-posteos` de `.claude/launch.json` (esa carpeta no se versiona: si falta, es un `node` con `social/selector/server.mjs` y puerto 4180).

- **Proyecto:** el selector arriba muestra los proyectos con fotos propias (los mismos de `portfolio/scripts/data/site.js`). Los que tienen material de terceros sin confirmar muestran "permiso pendiente" y un aviso en el posteo. Esa lista está en `PERMISOS_PENDIENTES`, dentro de `server.mjs`: actualizarla cuando se confirme un permiso.
- **Fotos:** tocá una foto para sumarla al posteo activo (queda numerada) y de nuevo para quitarla. Se ven recortadas en 4:5, como en el feed.
- **Posteos:** cada uno es un **Carrusel** (la primera foto es la portada con el título; las demás llevan un epígrafe; opcionalmente cierra con una lámina de contacto) o una **Foto con texto** (solo la primera foto, con título y etiqueta encima). Se ordenan con ↑ y ↓.
- **Guardado:** automático, en `social/selector/seleccion.json`. Ese archivo es el que se pasa a Figma para armar las láminas. Solo escucha en `127.0.0.1`.

## Configuración (una sola vez)

### 1. Cuentas

- El Instagram tiene que ser **profesional** (Business o Creator): Configuración → Tipo de cuenta y herramientas → Cambiar a cuenta profesional. Con una cuenta personal la API no deja publicar.
- Tiene que estar **vinculado a la página de Facebook** de theCrow.: en la página, Configuración → Cuentas vinculadas → Instagram.

### 2. App de Meta

1. Entrar a https://developers.facebook.com con el usuario que administra la página y crear una app (tipo **Business**).
2. Dejarla en modo **Desarrollo**. Siendo administrador de la app y de la página, los permisos funcionan sobre tus propias cuentas sin pasar por la revisión de Meta.
3. Anotar el **ID de la app** y la **clave secreta** (Configuración → Básica).

Los menús de Meta cambian seguido; si algo no está donde dice acá, buscar "Instagram API with Facebook Login" en la documentación de Meta.

### 3. Token

1. Abrir el **Graph API Explorer** (https://developers.facebook.com/tools/explorer), elegir la app y "Token de usuario".
2. Agregar los permisos: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`. Si la página está dentro de un portfolio comercial de Meta, sumar `business_management`.
3. Generar el token y copiarlo.

### 4. Cargar y correr `setup`

```bash
cp social/.env.example social/.env
```

Completar en `social/.env` `META_APP_ID`, `META_APP_SECRET` y `META_USER_TOKEN`, y después:

```bash
node social/cli.mjs setup
node social/cli.mjs check
```

`setup` extiende el token, busca la página y el Instagram vinculado y guarda el token de página (que no vence mientras el permiso siga vigente) y los IDs en `social/.env`. Después se puede borrar la línea `META_USER_TOKEN`.

Los tokens y la clave secreta son como una contraseña: no van al chat, a git ni a capturas. `social/.env` está ignorado por git y se crea con permisos solo para tu usuario.

## Uso

```bash
node social/cli.mjs list                                      # qué proyectos se pueden publicar
node social/cli.mjs prepare veredas-extremas --pick 1-5       # fotos a JPG para Instagram
cd portfolio && vercel deploy --prod --yes                    # Meta lee los archivos desde la web
node social/cli.mjs post veredas-extremas --pick 1-5          # simulación
node social/cli.mjs post veredas-extremas --pick 1-5 --publish
```

Para láminas propias (por ejemplo, un carrusel exportado de Figma en JPG 1080×1350), en vez de fotos de un proyecto:

```bash
node social/cli.mjs post-files social/exports/broterra-carrusel --caption-file social/exports/broterra-carrusel.txt            # simulación; copia los JPG a portfolio/media/_social/
cd portfolio && vercel deploy --prod --yes
node social/cli.mjs post-files social/exports/broterra-carrusel --caption-file social/exports/broterra-carrusel.txt --publish
```

Publica los JPG de la carpeta en orden alfabético (máximo 10).

- `--pick` elige piezas por su número, de a una o por rango (`1,3,5-8`). Máximo 10 (límite de un carrusel de Instagram).
- `--to ig` o `--to fb` publica en una sola red; por defecto va a las dos.
- `--caption "..."` o `--caption-file texto.txt` pone el texto. Si no se pasa, usa título, detalle, premio y link al proyecto.
- `--ratio 4:5` o `--ratio 1:1` en `prepare` fuerza el recorte de todas las fotos a esa proporción (conviene para carruseles).

Qué publica según lo elegido:

| Piezas | Instagram | Facebook |
|---|---|---|
| 1 foto | Post | Foto |
| 2 a 10 fotos | Carrusel | Post con varias fotos |
| 1 video | Reel (también en el feed) | Video |
| Mezcla | Carrusel | Solo las fotos |

## Límites y detalles

- **Solo salen proyectos con archivos propios.** Los que usan reproductor de Adobe (`type: "adobe"`) no tienen archivo para subir; `list` los marca.
- **Fotos:** Instagram solo acepta JPG y proporciones entre 4:5 y 1,91:1. Las fotos de la web son WebP y muchas son 9:16, por eso `prepare` las convierte y recorta (el recorte favorece la parte de arriba) a `portfolio/media/_social/<slug>/`.
- **URLs públicas:** Meta descarga los archivos desde internet, no los recibe desde tu computadora. Por eso hay que publicar la web después de `prepare`; el script lo verifica antes de publicar.
- **Videos:** los de la web son mp4 H.264 sin audio, aptos para Reels. Si no son verticales 9:16, Instagram los muestra con bandas. La API no permite agregar música de Instagram.
- **Texto:** hasta 2200 caracteres en Instagram.
- **Cupo:** Instagram limita las publicaciones por API por cuenta cada 24 horas; con el ritmo de un estudio no se alcanza.
- **Versión de la API:** `GRAPH_VERSION` en `.env`. Meta retira versiones viejas cada tanto; si empieza a fallar sin cambios, probar con la más nueva.
- Verificado contra la documentación de la Graph API conocida al escribirlo, pero sin probar con una cuenta real: la primera publicación conviene hacerla con una pieza de prueba.

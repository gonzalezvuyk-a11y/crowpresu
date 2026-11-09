#!/bin/bash
# Regenera la imagen para compartir (og.png) y los íconos del sitio.
# Requiere Google Chrome y ffmpeg. Uso: portfolio/brand/build.sh
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot() {  # archivo.html  ancho,alto  salida.png
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --virtual-time-budget=10000 --window-size="$2" --screenshot="$3" "file://$PWD/brand/$1" >/dev/null 2>&1
}
scale() {  # entrada  lado  salida
  ffmpeg -nostdin -loglevel error -y -i "$1" -vf "scale=$2:$2:flags=lanczos" "$3"
}

shot og.html 1200,630 og.png
shot icon.html 512,512 assets/icons/icon-512.png
scale assets/icons/icon-512.png 192 assets/icons/icon-192.png
scale assets/icons/icon-512.png 180 assets/icons/apple-touch-icon.png
scale assets/icons/icon-512.png 32  assets/icons/favicon-32.png
scale assets/icons/icon-512.png 48  favicon.ico

# favicon.svg: fondo blanco + isotipo negro (mismas proporciones que icon.html)
python3 -I - <<'PY'
import re
src = open("assets/logo/crow-ink-isotipo.svg", encoding="utf-8").read()
style = re.search(r"<style>.*?</style>", src, re.S).group(0)
inner = src[src.index('<g id="Capa_2-2"'):src.rindex("</svg>")]
h = 400; w = h * 763.72 / 889.41
x = (512 - w) / 2; y = (512 - h) / 2
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#fff"/>'
       f'<svg x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h}" viewBox="0 0 763.72 889.41"><defs>{style}</defs>{inner}</svg></svg>')
open("assets/icons/favicon.svg", "w", encoding="utf-8").write(svg)
PY
echo "listo: og.png, favicon.ico, favicon.svg, assets/icons/*"

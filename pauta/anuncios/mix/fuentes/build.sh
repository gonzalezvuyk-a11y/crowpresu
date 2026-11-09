#!/bin/bash
# Prepara las piezas del mix para DaVinci Resolve: capas de texto (PNG con alfa) y clips de duración fija.
# Resolve ignora la duración pedida para fotos sueltas (les pone 5 s), por eso cada foto entra como un mp4 de 1 s
# y cada capa de texto como un ProRes 4444 con alfa. Requiere Google Chrome y ffmpeg. Uso: pauta/anuncios/mix/fuentes/build.sh
set -euo pipefail
cd "$(dirname "$0")"
W="../../../../selected works"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p render clips
for n in gancho titulo-cobertura titulo-marcas titulo-spots final; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=8000 \
    --default-background-color=00000000 --allow-file-access-from-files --window-size=1080,1920 \
    --screenshot="$PWD/render/$n.png" "file://$PWD/$n.html" >/dev/null 2>&1
done
while IFS='|' read -r name src; do
  ffmpeg -nostdin -loglevel error -y -loop 1 -framerate 30 -t 1 -i "$W/$src" \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,format=yuv420p" \
    -c:v libx264 -preset slow -crf 14 -r 30 "clips/foto-$name.mp4"
done < fotos.txt
for n in gancho titulo-cobertura titulo-marcas titulo-spots; do
  ffmpeg -nostdin -loglevel error -y -loop 1 -framerate 30 -t 4 -i "render/$n.png" \
    -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le -r 30 "clips/capa-$n.mov"
done
ffmpeg -nostdin -loglevel error -y -loop 1 -framerate 30 -t 3 -i render/final.png -vf format=yuv420p \
  -c:v libx264 -preset slow -crf 14 -r 30 clips/final.mp4
echo "listo: render/ y clips/ (importar clips/ en el proyecto de Resolve 'theCrow Pauta Mix')"

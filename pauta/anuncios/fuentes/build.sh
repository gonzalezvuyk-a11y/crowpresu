#!/bin/bash
# Arma los dos anuncios de pauta (1080×1920, 30 fps, H.264, audio silencioso) a partir de selected works.
# Requiere Google Chrome y ffmpeg. Uso: pauta/anuncios/fuentes/build.sh
set -euo pipefail
cd "$(dirname "$0")"
W="../../../selected works"
OUT=".."
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
render() {  # archivo.html  salida.png
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=10000 \
    --default-background-color=00000000 --window-size=1080,1920 --screenshot="$PWD/render/$2" "file://$PWD/$1" >/dev/null 2>&1
}
mkdir -p render
render titulo-realtime.html titulo-realtime.png
render sello-premio.html sello-premio.png
render final-realtime.html final-realtime.png
render final-premio.html final-premio.png

VIDEO="-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r 30"
FINAL="-c:a aac -b:a 128k -movflags +faststart"

clip() {  # origen inicio duración salida
  ffmpeg -nostdin -loglevel error -y -ss "$2" -t "$3" -i "$1" -an \
    -vf "scale=1080:1920:flags=lanczos,setsar=1,fps=30,format=yuv420p" $VIDEO "$4"
}
endcard() {  # imagen duración salida
  ffmpeg -nostdin -loglevel error -y -loop 1 -framerate 30 -t "$2" -i "$1" \
    -vf "fade=in:st=0:d=0.3,format=yuv420p" $VIDEO "$3"
}
# capa transparente sobre el video, con fundido de entrada y salida
withlayer() {  # video capa desde hasta salida
  local d; d=$(python3 -I -c "print(round($4-$3,2))")
  ffmpeg -nostdin -loglevel error -y -i "$1" -loop 1 -framerate 30 -t "$d" -i "$2" -filter_complex \
    "[1]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st=$(python3 -I -c "print(round($d-0.4,2))"):d=0.4:alpha=1,setpts=PTS+$3/TB[l];[0][l]overlay=0:0:eof_action=pass,format=yuv420p" \
    $VIDEO "$5"
}
join() {  # salida entrada1 entrada2 ...  (con pista de audio silenciosa para que Meta la acepte sin avisos)
  local out="$1"; shift
  local ins=() n=0 fc=""
  for f in "$@"; do ins+=(-i "$f"); fc+="[$n:v]"; n=$((n+1)); done
  ffmpeg -nostdin -loglevel error -y "${ins[@]}" -f lavfi -i anullsrc=r=48000:cl=stereo \
    -filter_complex "${fc}concat=n=$n:v=1:a=0[v]" -map "[v]" -map "$n:a" -shortest $VIDEO $FINAL "$out"
}

# ---------- Anuncio 1: Cobertura realtime (sin Pilsen) ----------
clip "$W/NB/Clips NB.MP4"                 12.0 1.7 "$TMP/s1.mp4"
clip "$W/Clips Vogue.mp4"                 5.0  1.7 "$TMP/s2.mp4"
clip "$W/aquabrava/Clips Aquabrava.mp4"   6.4  1.7 "$TMP/s3.mp4"
clip "$W/NB/Clips NB.MP4"                 42.5 1.7 "$TMP/s4.mp4"
clip "$W/Clips Vogue.mp4"                 13.2 1.7 "$TMP/s5.mp4"
clip "$W/aquabrava/Clips Aquabrava.mp4"   27.5 1.7 "$TMP/s6.mp4"
join "$TMP/montaje.mp4" "$TMP"/s1.mp4 "$TMP"/s2.mp4 "$TMP"/s3.mp4 "$TMP"/s4.mp4 "$TMP"/s5.mp4 "$TMP"/s6.mp4
withlayer "$TMP/montaje.mp4" render/titulo-realtime.png 0.15 3.6 "$TMP/a1-cuerpo.mp4"
endcard render/final-realtime.png 2.4 "$TMP/a1-final.mp4"
join "$OUT/anuncio-1-cobertura-realtime.mp4" "$TMP/a1-cuerpo.mp4" "$TMP/a1-final.mp4"

# ---------- Anuncio 2: Premio (spot de Veredas Extremas, 12,9 s) ----------
# El spot tiene sus frases clave muy abajo ("Las mías no", "Moverse no debería ser un deporte extremo"),
# donde Reels e historias ponen el texto del anuncio y el botón. Se achica al 86 % y se sube, sobre el
# mismo video desenfocado, para que esas frases queden dentro de la zona visible. No se recorta nada.
ffmpeg -nostdin -loglevel error -y -t 12.95 -i "$W/veredas/Veredas-Reel-1-Master.mov" -an -filter_complex \
  "[0]scale=1080:1920:flags=lanczos,fps=30,split[a][b];[a]scale=270:480,boxblur=12:2,scale=1080:1920,eq=brightness=-0.22[fondo];[b]scale=928:1652:flags=lanczos[spot];[fondo][spot]overlay=76:20,setsar=1,format=yuv420p" \
  $VIDEO "$TMP/spot.mp4"
withlayer "$TMP/spot.mp4" render/sello-premio.png 0.3 3.8 "$TMP/a2-cuerpo.mp4"
endcard render/final-premio.png 2.0 "$TMP/a2-final.mp4"
join "$OUT/anuncio-2-premio.mp4" "$TMP/a2-cuerpo.mp4" "$TMP/a2-final.mp4"

# miniaturas (para elegir portada en Ads Manager)
ffmpeg -nostdin -loglevel error -y -ss 1.6 -i "$OUT/anuncio-1-cobertura-realtime.mp4" -frames:v 1 -q:v 3 "$OUT/anuncio-1-miniatura.jpg"
ffmpeg -nostdin -loglevel error -y -ss 1.6 -i "$OUT/anuncio-2-premio.mp4" -frames:v 1 -q:v 3 "$OUT/anuncio-2-miniatura.jpg"
echo "listo: anuncio-1-cobertura-realtime.mp4, anuncio-2-premio.mp4"

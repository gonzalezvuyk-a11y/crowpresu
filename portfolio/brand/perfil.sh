#!/bin/bash
# Fotos de perfil (1080×1080, dorado sobre blanco) para Facebook e Instagram. Requiere Google Chrome.
set -euo pipefail
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p perfiles
for n in isotipo logotipo; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1080,1080 \
    --screenshot="$PWD/perfiles/perfil-$n-dorado.png" "file://$PWD/perfil-$n.html" >/dev/null 2>&1
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1080,1080 \
    --screenshot="$PWD/perfiles/perfil-$n-negro.png" "file://$PWD/perfil-$n-negro.html" >/dev/null 2>&1
done
echo "listo: brand/perfiles/perfil-{isotipo,logotipo}-{dorado,negro}.png"

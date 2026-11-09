#!/bin/bash
# Portadas de Facebook (1640×720, oscura y clara). Requiere Google Chrome.
set -euo pipefail
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p portadas
for t in oscuro claro; do
  "$CHROME" --headless=new --disable-gpu --allow-file-access-from-files --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=10000 --window-size=1640,720 \
    --screenshot="$PWD/portadas/portada-facebook-$t.png" "file://$PWD/portada-facebook-$t.html" >/dev/null 2>&1
done
echo "listo: brand/portadas/portada-facebook-{oscuro,claro}.png"

#!/usr/bin/env bash
# Render the site to PNG in both colour schemes, so a layout can be looked at
# rather than reasoned about.
#
# Several faults in this site's design were invisible to every build step and
# obvious in a screenshot: a CSS rule cancelled by a more specific one, a
# marker overlapping the text it labels, a caption clipped by its container.
#
# Needs a Chromium with headless support. Playwright's copy is used if present.
#
#   scripts/screenshots.sh [output-directory] [page-path ...]
#   scripts/screenshots.sh /tmp/shots / reference/specifications/

set -euo pipefail

OUT="${1:-_screenshots}"
shift || true
PAGES=("${@:-/}")

PORT_LIGHT=8791
PORT_DARK=8792
VENV="${VENV:-.venv}"

BROWSER="${BROWSER:-}"
if [ -z "$BROWSER" ]; then
  BROWSER=$(find "$HOME/.cache/ms-playwright" -name chrome-headless-shell -type f 2>/dev/null | sort | tail -1)
fi
if [ -z "$BROWSER" ] || [ ! -x "$BROWSER" ]; then
  echo "no headless chromium found; set BROWSER=/path/to/chrome" >&2
  exit 1
fi

mkdir -p "$OUT"

# The dark build exists because a rasteriser has no colour-scheme preference to
# read. Material carries the scheme in a data attribute, so the only reliable
# way to photograph it is to build a site whose only palette is the dark one.
DARK_CONFIG=$(mktemp .mkdocs-dark-XXXX.yml)
trap 'rm -f "$DARK_CONFIG"; kill %1 %2 2>/dev/null || true' EXIT

python3 - "$DARK_CONFIG" <<'PY'
import re, sys
from pathlib import Path

config = Path("mkdocs.yml").read_text()
config = re.sub(
    r"  palette:\n(?:    .*\n|      .*\n|        .*\n)+",
    "  palette:\n    scheme: slate\n    primary: custom\n    accent: custom\n",
    config,
)
Path(sys.argv[1]).write_text(config)
PY

"$VENV/bin/mkdocs" build -q
"$VENV/bin/mkdocs" build -q -f "$DARK_CONFIG" -d _site_dark

python3 -m http.server "$PORT_LIGHT" --directory _site >/dev/null 2>&1 &
python3 -m http.server "$PORT_DARK" --directory _site_dark >/dev/null 2>&1 &
sleep 2

for page in "${PAGES[@]}"; do
  name=$(echo "$page" | tr -c 'a-zA-Z0-9' '-' | sed 's/^-*//; s/-*$//')
  name=${name:-home}
  for scheme in light dark; do
    port=$PORT_LIGHT
    [ "$scheme" = dark ] && port=$PORT_DARK
    "$BROWSER" --headless --disable-gpu --no-sandbox --disable-dev-shm-usage \
      --hide-scrollbars --virtual-time-budget=5000 \
      --screenshot="$OUT/$name-$scheme.png" --window-size=1440,1400 \
      "http://127.0.0.1:$port/$page" 2>/dev/null
    echo "$OUT/$name-$scheme.png"
  done
done

rm -rf _site_dark

#!/bin/bash
# make.sh <workdir>
#
# Rebuilds the five 1280x800 store screenshots in store/screenshots/ (one set
# for Chrome Web Store, AMO, Edge and the Mac App Store). Needs ffmpeg, node
# and Google Chrome, and the built Chrome zip from ./build.sh.
#
# <workdir>/cap/ holds the captures of real x.com. They are not in git: X's UI
# moves on, so retake them each time. All are of x.com/<your profile> (your own
# posts, no strangers; "You might like" hidden), logged in, Dim on, default
# button color, taken with Claude in Chrome's zoom-to-file at 2x:
#
#   dim-{a,b,c,d}.png    the page in Dim, four tiles of 660x448 CSS px:
#   black-{a,b,c,d}.png  the same with Dim off (X's Dark)
#                        a = 0,0   b = 659,0   c = 0,448   d = 659,448
#   modal-{a,b,c,d}.png  X's Settings > Appearance dialog (955x676 at 182,110),
#                        tiles at 182,110  477,110  182,338  477,338
#   full-<theme>.png     the whole viewport (1319x896) in each of the six themes
#
# The viewport was 1326x901. For the theme captures the extension's own
# stylesheet was regenerated per theme with its own palette function, and its
# hash checked against buildFullCSS() run in node, rather than clicking through
# the popup six times.
#
# The popup, Extras and Sidebar pages are the real ones from the zip, loaded
# with a stubbed chrome.* object (mkstub.js) and their state in the URL.
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
OUT="$(dirname "$SRC")"
WORK="${1:?usage: make.sh <workdir with cap/>}"
VER=$(python3 -c "import json; print(json.load(open('$SRC/../../../manifest.json'))['version'])")
ZIP="${ZIP:-$HOME/Downloads/x-dim-mode-$VER.zip}"
PORT=8812
cd "$WORK"

# ── Extension pages, from the built package ──
rm -rf pages && mkdir pages && unzip -q "$ZIP" -d pages
node "$SRC/mkstub.js"
for h in pages/*.html; do perl -0pi -e 's|<script src=|<script src="stub.js"></script>\n  <script src=|' "$h"; done

# ── Captures: stitch the 2x tiles, then one Lanczos pass to each final size ──
F() { ffmpeg -loglevel error -y "$@"; }
stitch() {
  F -i cap/$1-a.png -i cap/$1-b.png -i cap/$1-c.png -i cap/$1-d.png -filter_complex \
    "[0]scale=1320:896:flags=lanczos[a];[1]scale=1320:896:flags=lanczos,crop=1318:896:2:0[b];[2]scale=1320:896:flags=lanczos[c];[3]scale=1320:896:flags=lanczos,crop=1318:896:2:0[d];[a][b]hstack[t];[c][d]hstack[u];[t][u]vstack[o]" \
    -map "[o]" -pix_fmt rgb24 cap/$1-2x.png
}
stitch dim; stitch black
# The lower modal tiles lose their top 32px so the seam misses a row of text.
F -f lavfi -i color=c=0x16212c:s=1910x1352 -i cap/modal-a.png -i cap/modal-b.png -i cap/modal-c.png -i cap/modal-d.png -filter_complex \
  "[1]scale=1320:896:flags=lanczos[a];[2]scale=1320:896:flags=lanczos[b];[3]scale=1320:896:flags=lanczos,crop=1320:832:0:64[c];[4]scale=1320:896:flags=lanczos,crop=1320:832:0:64[d];[0][a]overlay=0:0[x1];[x1][b]overlay=590:0[x2];[x2][c]overlay=0:520[x3];[x3][d]overlay=590:520[o]" \
  -map "[o]" -frames:v 1 -pix_fmt rgb24 cap/modal-2x.png
mkdir -p img out
F -i cap/dim-2x.png   -vf "scale=1152:-1:flags=lanczos" -pix_fmt rgb24 img/s1-dim.png
F -i cap/black-2x.png -vf "scale=1152:-1:flags=lanczos" -pix_fmt rgb24 img/s1-black.png
# Shot 3 is the dialog's Background group alone, shown at 1.5x.
F -i cap/modal-2x.png -vf "crop=1350:608:560:744,scale=1012:456:flags=lanczos" -pix_fmt rgb24 img/s3-background.png
for t in dim slate jade plum dusk ember; do
  F -i cap/full-$t.png -vf "scale=1152:-1:flags=lanczos" -pix_fmt rgb24 img/s4-$t.png
done
cp "$SRC"/*.html "$SRC/shots.css" "$SRC/fit.js" .

# ── Render ──
python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
trap "kill $! 2>/dev/null" EXIT
sleep 1
for n in 1-dim-is-back 2-before-after 3-in-x-settings 4-themes 5-extras; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1280,800 --virtual-time-budget=6000 \
    --user-data-dir="$WORK/chrome-profile" --screenshot="$WORK/out/$n.png" "http://127.0.0.1:$PORT/$n.html" >/dev/null 2>&1
  # Stores want 24-bit PNG with no alpha channel.
  F -i out/$n.png -pix_fmt rgb24 "$OUT/$n.png"
  echo "$OUT/$n.png"
done

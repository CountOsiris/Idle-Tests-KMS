#!/bin/bash
# =====================================================================
#  tools/run.sh - runs the balance bot or the pre-upload check in a hidden
#  Microsoft Edge window and prints what it found. See tools/README.md.
#
#    bash tools/run.sh sim "h=14,c=warden"        the balance bot, with its options
#    bash tools/run.sh check tools/saves/save-v3.json   load an old save, then check
#    bash tools/run.sh shot "openUpdates()" out.png     a picture of the page, after running some code
#
#  It makes a throwaway copy of index.html with the tool added, opens it with a
#  fresh browser profile (so your own saves are never touched), and removes the
#  copy afterwards.
# =====================================================================

cd "$(dirname "$0")/.." || exit 1
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
PROFILE="$(mktemp -d)"
PAGE="tools-run-$$.html"
PRE=""

if [ "$1" = "sim" ]; then
  sed 's#</body>#<script src="tools/bot.js"></script></body>#' index.html > "$PAGE"
  HASH="$2"
elif [ "$1" = "check" ]; then
  # The old save goes in before the game loads, and a copy is kept to compare with
  PRE="tools-pre-$$.js"
  {
    echo "window.savedBefore = $(cat "$2");"
    echo "window.savedBefore.lastTick = Date.now();"
    echo "localStorage.setItem(\"lloegrys-idle-save-3\", JSON.stringify(window.savedBefore));"
    echo "window.onerror = function (m, f, l) { window.pageErrors = (window.pageErrors || \"\") + m + \" @\" + f + \":\" + l + \"\\n\"; };"
  } > "$PRE"
  sed "s#<script>const gameVersion#<script src=\"$PRE\"></script><script>const gameVersion#; s#</body>#<script src=\"tools/check.js\"></script></body>#" index.html > "$PAGE"
  HASH="check"
elif [ "$1" = "shot" ]; then
  # A picture of the page as a new player sees it, after running the code given
  PRE="tools-pre-$$.js"
  {
    echo "clearInterval(timer);"
    echo "$2"
    echo "updateScreen();"
  } > "$PRE"
  sed "s#</body>#<script src=\"$PRE\"></script></body>#" index.html > "$PAGE"
  "$EDGE" --headless --disable-gpu "--user-data-dir=$(cygpath -w "$PROFILE")" --hide-scrollbars     "--window-size=${4:-1300,1000}" --virtual-time-budget=5000 "--screenshot=$(cygpath -w "$(realpath -m "$3")")"     "file:///$(cygpath -m "$PWD")/$PAGE" 2>/dev/null
  rm -f "$PAGE" "$PRE"
  rm -rf "$PROFILE"
  echo "Saved $3"
  exit 0
else
  echo "Use: bash tools/run.sh sim \"h=14,c=warden\"   or   bash tools/run.sh check tools/saves/save-v3.json"
  exit 1
fi

"$EDGE" --headless --disable-gpu "--user-data-dir=$(cygpath -w "$PROFILE")" --virtual-time-budget=600000 \
  --dump-dom "file:///$(cygpath -m "$PWD")/$PAGE#$HASH" 2>/dev/null \
  | sed -n '/<pre id="test-out">/,/<\/pre>/p' | sed 's/<[^>]*>//g;s/&gt;/>/g;s/&lt;/</g;s/&amp;/\&/g;s/&quot;/"/g'

rm -f "$PAGE" "$PRE"
rm -rf "$PROFILE"

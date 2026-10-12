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

# ---------------------------------------------------------------------
#  Only a few Edge windows at once. Each run opens its own hidden Edge, and
#  eighteen of them together crashed the PC (12 October 2026). So every run
#  takes one of MAX_EDGE numbered slots before it opens Edge, and waits for
#  one to come free if they are all taken. However many runs are started
#  together, no more than MAX_EDGE browsers are ever open.
#
#  To change the limit for one command:  LLOEGRYS_MAX_EDGE=2 bash tools/run.sh ...
# ---------------------------------------------------------------------
MAX_EDGE="${LLOEGRYS_MAX_EDGE:-3}"
SLOTS="${TMPDIR:-/tmp}/lloegrys-edge-slots"
SLOT=""

function waitForSlot() {
  mkdir -p "$SLOTS"
  while [ "$SLOT" = "" ]; do
    for n in $(seq 1 "$MAX_EDGE"); do
      # A slot whose run is no longer alive (a crash, a closed window) is free again
      # (the number is read once: the slot can be given up while we look at it)
      owner="$(cat "$SLOTS/$n/pid" 2>/dev/null)"
      if [ "$owner" != "" ] && ! kill -0 "$owner" 2>/dev/null; then
        rm -rf "$SLOTS/$n"
      elif [ -d "$SLOTS/$n" ] && [ ! -f "$SLOTS/$n/pid" ] && [ "$(find "$SLOTS/$n" -maxdepth 0 -mmin +1)" != "" ]; then
        rm -rf "$SLOTS/$n"
      fi
      # mkdir fails if another run made the folder first, so only one run gets a slot
      if mkdir "$SLOTS/$n" 2>/dev/null; then
        echo $$ > "$SLOTS/$n/pid"
        SLOT="$SLOTS/$n"
        break
      fi
    done
    if [ "$SLOT" = "" ]; then
      sleep 2
    fi
  done
}

function freeSlot() {
  if [ "$SLOT" != "" ]; then
    rm -rf "$SLOT"
  fi
}
trap freeSlot EXIT

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
  waitForSlot
  "$EDGE" --headless --disable-gpu "--user-data-dir=$(cygpath -w "$PROFILE")" --hide-scrollbars     "--window-size=${4:-1300,1000}" --virtual-time-budget=5000 "--screenshot=$(cygpath -w "$(realpath -m "$3")")"     "file:///$(cygpath -m "$PWD")/$PAGE" 2>/dev/null
  rm -f "$PAGE" "$PRE"
  rm -rf "$PROFILE"
  echo "Saved $3"
  exit 0
else
  echo "Use: bash tools/run.sh sim \"h=14,c=warden\"   or   bash tools/run.sh check tools/saves/save-v3.json"
  exit 1
fi

waitForSlot
"$EDGE" --headless --disable-gpu "--user-data-dir=$(cygpath -w "$PROFILE")" --virtual-time-budget=600000 \
  --dump-dom "file:///$(cygpath -m "$PWD")/$PAGE#$HASH" 2>/dev/null \
  | sed -n '/<pre id="test-out">/,/<\/pre>/p' | sed 's/<[^>]*>//g;s/&gt;/>/g;s/&lt;/</g;s/&amp;/\&/g;s/&quot;/"/g'

rm -f "$PAGE" "$PRE"
rm -rf "$PROFILE"

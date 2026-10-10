#!/bin/bash
# =====================================================================
#  tools/version.sh - sets the game's version in all three places at once:
#  gameVersion and every ?v= in index.html, and the file version.txt.
#
#    bash tools/version.sh 20261011a
#
#  Then add an entry for it at the top of updates.js (the pre-upload check
#  fails if the newest entry there is not for this version).
# =====================================================================

cd "$(dirname "$0")/.." || exit 1
OLD="$(tr -d '\r\n' < version.txt)"
NEW="$1"

if [ -z "$NEW" ]; then
  echo "Use: bash tools/version.sh 20261011a   (the version now is $OLD)"
  exit 1
fi

sed -i "s/$OLD/$NEW/g" index.html
printf '%s\n' "$NEW" > version.txt
echo "Version $OLD -> $NEW ($(grep -c "$NEW" index.html) places in index.html, and version.txt)"

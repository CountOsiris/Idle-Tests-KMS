#!/bin/bash
# =====================================================================
#  tools/balance.sh - the build balance report. NOT part of the game.
#
#  Plays every weapon (or element) of every class with the balance bot, several
#  times over, and says how long each took to reach a floor compared with the
#  average of its class. The target (docs/design/04-classes-and-builds.md) is
#  every build within 25% of its class's average to floor 50.
#
#    bash tools/balance.sh                 30 hours, 3 runs, floor 50, every class
#    bash tools/balance.sh 30 5 50         hours, runs, floor
#    bash tools/balance.sh 30 3 50 ranger  one class only
#
#  A build that never reached the floor counts as the full hours, and is marked.
#  The bot's luck moves a single run by 10% or more: trust the average, not one run.
# =====================================================================

cd "$(dirname "$0")/.." || exit 1
HOURS="${1:-30}"
RUNS="${2:-3}"
FLOOR="${3:-50}"
OPTIONS="h=$HOURS,every,ascend"
if [ -n "$4" ]; then
  OPTIONS="$OPTIONS,c=$4"
fi

for i in $(seq "$RUNS"); do
  bash tools/run.sh sim "$OPTIONS"
done | awk -v floor="F$FLOOR" -v hours="$HOURS" -v runs="$RUNS" '
  /^#/ || /ascensions:/ || /killers:/ || NF == 0 { next }
  {
    build = $1
    time = hours
    missed = 1
    for (i = 2; i < NF; i++) {
      if ($i == floor) {
        value = $(i + 1)
        if (value ~ /m$/) { sub(/m/, "", value); time = value / 60; missed = 0 }
        else if (value ~ /h$/) { sub(/h/, "", value); time = value + 0; missed = 0 }
      }
    }
    if (!(build in total)) { order[++count] = build }
    total[build] += time
    seen[build]++
    misses[build] += missed
  }
  END {
    for (n = 1; n <= count; n++) {
      build = order[n]
      split(build, parts, "/")
      mean[build] = total[build] / seen[build]
      classTotal[parts[1]] += mean[build]
      classCount[parts[1]]++
    }
    printf "Hours to floor %s, average of %d runs of %s hours (target: within 25%% of the class)\n", substr(floor, 2), runs, hours
    worst = 0
    for (n = 1; n <= count; n++) {
      build = order[n]
      split(build, parts, "/")
      average = classTotal[parts[1]] / classCount[parts[1]]
      off = (mean[build] / average - 1) * 100
      note = ""
      if (misses[build] > 0) { note = "  (never got there in " misses[build] " of " seen[build] " runs)" }
      flag = "ok  "
      if (off > 25 || off < -25) { flag = "OFF "; worst++ }
      printf "%s %-24s %5.1fh  %+4.0f%%  (class %4.1fh)%s\n", flag, build, mean[build], off, average, note
    }
    if (worst == 0) { print "EVERY BUILD WITHIN 25%" } else { print worst " BUILD(S) OUTSIDE 25%" }
  }'

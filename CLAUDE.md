# Lloegrys Idle

A plain HTML, CSS and JavaScript idle game with no build step. Friends play the live
site, so old saves must always load.

**Before adding or changing any content or rule, read [docs/MAP.md](docs/MAP.md)** and
look up every bonus word you touch in [docs/MAP-WORDS.md](docs/MAP-WORDS.md). MAP.md says
where things are, how a number becomes damage, which layers are allowed to multiply
which, the mistakes already made, and the checklist to follow. Run `python tools/map.py`
after changing content and read what it prints.

- The game's code is written for a beginner to read: plain functions, many comments,
  content as lists with a "to add one" note. Keep it that way.
- Test with `bash tools/run.sh check tools/saves/<save>.json` on all three saves; it must
  end `ALL GOOD`. Balance tools are in `tools/README.md`.
- A version is set with `bash tools/version.sh <new>`, and `updates.js` needs an entry
  for it.
- Publishing is `git push origin main` and happens only when the owner asks.

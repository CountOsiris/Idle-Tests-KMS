# tools

Testing tools. The game never loads anything in this folder.
They need Microsoft Edge (installed on Windows) and Git Bash.

## The balance bot

Plays classes for simulated hours in a hidden browser, as fast as the computer
allows, spending skill points, picking perks, using the blacksmith and (if asked)
ascending, then reports when each floor was first reached.

```
bash tools/run.sh sim "h=14"                   every class, 14 hours, no ascending
bash tools/run.sh sim "h=24,ascend,c=warlock"  one class, 24 hours, ascending when stuck
bash tools/run.sh sim "h=6,every,c=barbarian"  every weapon of one class
```

All the options are listed at the top of `bot.js`. A 14-hour run of every class
takes about a minute. The bot plays well but not perfectly; compare runs with each
other, not with real players, and run twice before trusting a small difference.

## The pre-upload check

Loads an old save into the current game, checks it came through, plays every class,
opens every tab, and checks the content lists (no name used twice, no missing text).

```
bash tools/run.sh check tools/saves/save-v3.json
```

It ends with `ALL GOOD` or the number of problems. Run it with every save in
`tools/saves/` before uploading.

## The saves

- `save-v1.json`: made by the version before the blacksmith (save version 1).
- `save-v3.json`: made by the version live on 9 October 2026 (save version 3).

When an upload changes `saveVersion`, make a save with the version that is live
before the upload and add it here, so every future update is checked against it.
